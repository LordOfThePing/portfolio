import "server-only";
import { getStore, type Store } from "@netlify/blobs";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Counter storage for the /links page.
 *
 * In production this uses Netlify Blobs, which needs no setup, no account and
 * no env vars — the Netlify runtime wires it up automatically.
 *
 * Under `next dev` Blobs isn't available, so we transparently fall back to a
 * local JSON file (.metrics-dev.json, gitignored). That keeps local testing
 * working without touching your real numbers.
 */

const STORE_NAME = "linktree-metrics";
const DEV_FILE = path.join(process.cwd(), ".metrics-dev.json");

export type Counters = Record<string, number>;

/** Counter keys. Keep these in one place so the dashboard and API agree. */
export const KEY = {
  /** Every load of /links. */
  visits: "visits",
  /** First load from a given device (deduped in the browser). */
  visitors: "visitors",
  click: (id: string) => `click:${id}`,
} as const;

export const CLICK_PREFIX = "click:";

let store: Store | null | undefined;

const isProduction = () => process.env.NODE_ENV === "production";

function blobStore(): Store | null {
  if (store !== undefined) return store;
  try {
    // Strong consistency: a click must be visible to the next read, otherwise
    // rapid clicks would read a stale value and overwrite each other.
    store = getStore({ name: STORE_NAME, consistency: "strong" });
  } catch (error) {
    // Not running on Netlify. Locally that's expected; in production it means
    // Blobs is genuinely broken, so say so loudly instead of quietly writing
    // counts to a serverless filesystem that vanishes on the next request.
    if (isProduction()) {
      throw new Error(
        `Netlify Blobs is unavailable in production, so clicks cannot be recorded: ${error}`,
      );
    }
    store = null;
  }
  return store;
}

async function devRead(): Promise<Counters> {
  try {
    return JSON.parse(await fs.readFile(DEV_FILE, "utf8")) as Counters;
  } catch {
    return {};
  }
}

async function devWrite(counters: Counters): Promise<void> {
  await fs.writeFile(DEV_FILE, JSON.stringify(counters, null, 2));
}

/**
 * Serializes read-modify-write. Neither backend has an atomic increment, so two
 * overlapping requests could otherwise both read N and both write N+1, losing a
 * count. This only guards one server instance, which is where nearly all real
 * contention shows up at this traffic level.
 *
 * Blobs locks per key (independent objects). The dev file rewrites the whole
 * document, so it must lock file-wide — a per-key lock there lets two different
 * keys clobber each other.
 */
const queues = new Map<string, Promise<unknown>>();
const DEV_LOCK = "__dev_file__";

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).then(fn, fn);
  // Swallow rejections on the chain itself so one failure can't poison the queue.
  queues.set(
    key,
    run.catch(() => {}),
  );
  return run;
}

async function incrementOne(key: string, by: number): Promise<void> {
  const blobs = blobStore();

  if (!blobs) {
    await withLock(DEV_LOCK, async () => {
      const counters = await devRead();
      counters[key] = (counters[key] ?? 0) + by;
      await devWrite(counters);
    });
    return;
  }

  await withLock(key, async () => {
    const current = await blobs.get(key, { type: "text" });
    const next = (Number(current) || 0) + by;
    await blobs.set(key, String(next));
  });
}

/** Bump one or more counters. Never throws — a metrics failure must not break a click. */
export async function increment(keys: string[], by = 1): Promise<void> {
  await Promise.all(
    keys.map((key) =>
      incrementOne(key, by).catch((error) => {
        console.error(`[metrics] failed to increment "${key}":`, error);
      }),
    ),
  );
}

/** Every counter, for the admin dashboard. Returns {} rather than crashing the page. */
export async function readAll(): Promise<Counters> {
  try {
    const blobs = blobStore();
    if (!blobs) return await devRead();

    const { blobs: entries } = await blobs.list();
    const values = await Promise.all(
      entries.map(async ({ key }) => {
        const value = await blobs.get(key, { type: "text" });
        return [key, Number(value) || 0] as const;
      }),
    );
    return Object.fromEntries(values);
  } catch (error) {
    console.error("[metrics] failed to read counters:", error);
    return {};
  }
}
