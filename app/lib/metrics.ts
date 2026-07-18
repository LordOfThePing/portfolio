import "server-only";
import { supabase } from "./supabase";

/**
 * Counter storage for the /links page, backed by Supabase.
 *
 * Writes append one row to `link_events` per visit/click (no locking, no race
 * conditions). Reads call the `link_metrics(from, to)` SQL function, which
 * returns one row per metric — 'visits', 'visitors', 'click:<id>' — so the
 * Stats dashboard keeps working against the same counter keys it always used.
 *
 * See supabase/schema.sql for the tables and function.
 */

export type Counters = Record<string, number>;

/** Metric names. Keep these in one place so the dashboard and reads agree. */
export const KEY = {
  /** Every load of /links. */
  visits: "visits",
  /** First load from a given device (deduped in the browser). */
  visitors: "visitors",
  click: (id: string) => `click:${id}`,
} as const;

export const CLICK_PREFIX = "click:";

/** UTC calendar day as YYYY-MM-DD. String order == date order. */
export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** N days ago (UTC), inclusive of today when n=0. */
export function utcDayAgo(n: number): string {
  return utcDay(new Date(Date.now() - n * 24 * 60 * 60 * 1000));
}

const DAY_MS = 24 * 60 * 60 * 1000;
const dayStart = (day: string) => new Date(`${day}T00:00:00.000Z`);
/** Start of the day AFTER `day` — the exclusive upper bound for a UTC range. */
const nextDayStart = (day: string) => new Date(dayStart(day).getTime() + DAY_MS);

/**
 * Record a visit. `firstVisit` is true only the first time a given device loads
 * /links (deduped client-side). Never throws — a metrics failure must not break
 * the page.
 */
export async function recordVisit(firstVisit: boolean): Promise<void> {
  try {
    const { error } = await supabase()
      .from("link_events")
      .insert({ kind: "visit", first_visit: firstVisit });
    if (error) throw error;
  } catch (error) {
    console.error("[metrics] failed to record visit:", error);
  }
}

/** Record a click on a link. Never throws — must not break the click. */
export async function recordClick(linkId: string): Promise<void> {
  try {
    const { error } = await supabase()
      .from("link_events")
      .insert({ kind: "click", link_id: linkId });
    if (error) throw error;
  } catch (error) {
    console.error(`[metrics] failed to record click "${linkId}":`, error);
  }
}

/**
 * Metric -> total count over the UTC range `from <= day <= to` (inclusive,
 * YYYY-MM-DD). Pass `from = null` for all time. Returns {} rather than crashing
 * the dashboard.
 */
export async function readRange(
  from: string | null,
  to: string,
): Promise<Counters> {
  try {
    const fromTs = (from ? dayStart(from) : new Date(0)).toISOString();
    const toTs = nextDayStart(to).toISOString();

    const { data, error } = await supabase().rpc("link_metrics", {
      from_ts: fromTs,
      to_ts: toTs,
    });
    if (error) throw error;

    const totals: Counters = {};
    for (const row of (data ?? []) as { metric: string; count: number }[]) {
      totals[row.metric] = Number(row.count) || 0;
    }
    return totals;
  } catch (error) {
    console.error("[metrics] failed to read counters:", error);
    return {};
  }
}
