import "server-only";
import {
  blobStore,
  devFilePath,
  devReadJson,
  devWriteJson,
  withLock,
} from "./blob-store";

/** Counter storage for the /links page. See ./blob-store for the backend rules. */

const STORE_NAME = "linktree-metrics";
const DEV_FILE = devFilePath("metrics");

/**
 * Blobs locks per key (independent objects). The dev file rewrites the whole
 * document, so it must lock file-wide — a per-key lock there lets two different
 * keys clobber each other.
 */
const DEV_LOCK = "__metrics_dev_file__";

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

const store = () => blobStore(STORE_NAME);

async function incrementOne(key: string, by: number): Promise<void> {
  const blobs = store();

  if (!blobs) {
    await withLock(DEV_LOCK, async () => {
      const counters = await devReadJson<Counters>(DEV_FILE, {});
      counters[key] = (counters[key] ?? 0) + by;
      await devWriteJson(DEV_FILE, counters);
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
    const blobs = store();
    if (!blobs) return await devReadJson<Counters>(DEV_FILE, {});

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
