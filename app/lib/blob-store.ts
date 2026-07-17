import "server-only";
import { getStore, type Store } from "@netlify/blobs";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Shared Netlify Blobs plumbing.
 *
 * On Netlify this needs no setup, no account and no env vars — the runtime
 * wires it up automatically. It's a global (site-wide) store, so its data
 * PERSISTS ACROSS DEPLOYS — new deploys never wipe your stats or config.
 *
 * Under `next dev` Blobs isn't available, so callers fall back to a local JSON
 * file (gitignored) and local testing keeps working.
 *
 * In production a missing Blobs backend is a real failure, not something to
 * paper over: writing to a serverless filesystem would look like it worked and
 * then vanish on the next request. So we throw instead of falling back.
 *
 * ⚠️  Never cache the returned Store across requests. On Netlify's Next.js
 * runtime the Blobs auth token is short-lived and refreshed per request. A
 * store held at module scope keeps its first token and later fails every
 * read/write with "Failed to decode token: Token expired" — which looks exactly
 * like data loss. getStore() is a cheap factory that re-reads the current token,
 * so we build a fresh store on every call.
 */

const isProduction = () => process.env.NODE_ENV === "production";

/** A Blobs store, or null when running locally (caller should use the dev file). */
export function blobStore(name: string): Store | null {
  try {
    // Strong consistency: a write must be visible to the next read, otherwise
    // rapid updates read a stale value and overwrite each other.
    return getStore({ name, consistency: "strong" });
  } catch (error) {
    if (isProduction()) {
      throw new Error(
        `Netlify Blobs is unavailable in production (store "${name}"): ${error}`,
      );
    }
    return null;
  }
}

export const devFilePath = (name: string) =>
  path.join(process.cwd(), `.${name}-dev.json`);

export async function devReadJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function devWriteJson(file: string, value: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(value, null, 2));
}

/**
 * Serializes read-modify-write. Blobs has no atomic increment, so two
 * overlapping requests could otherwise both read N and both write N+1, losing
 * an update. This only guards one server instance, which is where nearly all
 * real contention shows up at this traffic level.
 */
const queues = new Map<string, Promise<unknown>>();

export function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).then(fn, fn);
  // Swallow rejections on the chain itself so one failure can't poison the queue.
  queues.set(
    key,
    run.catch(() => {}),
  );
  return run;
}
