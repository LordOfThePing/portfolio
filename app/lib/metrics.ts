import "server-only";
import {
  blobStore,
  devFilePath,
  devReadJson,
  devWriteJson,
  withLock,
} from "./blob-store";

/**
 * Counter storage for the /links page. See ./blob-store for the backend rules.
 *
 * Counts are bucketed by UTC day so the Stats page can filter by date range
 * ("last 7 days", etc.). Each stored key is `YYYY-MM-DD#<metric>`, e.g.
 * `2026-07-17#visits` or `2026-07-17#click:github`. Reads sum the buckets that
 * fall inside the requested range.
 */

const STORE_NAME = "linktree-metrics";
const DEV_FILE = devFilePath("metrics");

/**
 * Blobs locks per key (independent objects). The dev file rewrites the whole
 * document, so it must lock file-wide — a per-key lock there lets two different
 * keys clobber each other.
 */
const DEV_LOCK = "__metrics_dev_file__";

export type Counters = Record<string, number>;

/** Metric names. Keep these in one place so the dashboard and API agree. */
export const KEY = {
  /** Every load of /links. */
  visits: "visits",
  /** First load from a given device (deduped in the browser). */
  visitors: "visitors",
  click: (id: string) => `click:${id}`,
} as const;

export const CLICK_PREFIX = "click:";

const store = () => blobStore(STORE_NAME);

/** UTC calendar day as YYYY-MM-DD. String order == date order, so ranges compare directly. */
export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** N days ago (UTC), inclusive of today when n=0. */
export function utcDayAgo(n: number): string {
  return utcDay(new Date(Date.now() - n * 24 * 60 * 60 * 1000));
}

const SEP = "#";
const bucketKey = (day: string, metric: string) => `${day}${SEP}${metric}`;

/** `2026-07-17#click:github` -> { day, metric: "click:github" }. */
function parseBucket(key: string): { day: string; metric: string } | null {
  const at = key.indexOf(SEP);
  if (at === -1) return null;
  return { day: key.slice(0, at), metric: key.slice(at + 1) };
}

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

/**
 * Bump one or more metrics for today's bucket. Never throws — a metrics failure
 * must not break a click.
 */
export async function increment(metrics: string[], by = 1): Promise<void> {
  const day = utcDay();
  await Promise.all(
    metrics.map((metric) =>
      incrementOne(bucketKey(day, metric), by).catch((error) => {
        console.error(`[metrics] failed to increment "${metric}":`, error);
      }),
    ),
  );
}

/** Every stored bucket as key -> count. */
async function readBuckets(): Promise<Counters> {
  const blobs = store();
  if (!blobs) return devReadJson<Counters>(DEV_FILE, {});

  const { blobs: entries } = await blobs.list();
  const values = await Promise.all(
    entries.map(async ({ key }) => {
      const value = await blobs.get(key, { type: "text" });
      return [key, Number(value) || 0] as const;
    }),
  );
  return Object.fromEntries(values);
}

/**
 * Metric -> total count, summed over buckets with `from <= day <= to`
 * (inclusive, YYYY-MM-DD). Pass `from = null` for all time.
 * Returns {} rather than crashing the dashboard.
 */
export async function readRange(
  from: string | null,
  to: string,
): Promise<Counters> {
  try {
    const buckets = await readBuckets();
    const totals: Counters = {};

    for (const [key, count] of Object.entries(buckets)) {
      const parsed = parseBucket(key);
      if (!parsed) continue; // ignore any legacy non-bucketed key
      if (from !== null && parsed.day < from) continue;
      if (parsed.day > to) continue;
      totals[parsed.metric] = (totals[parsed.metric] ?? 0) + count;
    }

    return totals;
  } catch (error) {
    console.error("[metrics] failed to read counters:", error);
    return {};
  }
}
