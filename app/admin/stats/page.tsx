import type { Metadata } from "next";
import { isAdmin } from "app/lib/admin-auth";
import { CLICK_PREFIX, KEY, readRange, utcDay, utcDayAgo } from "app/lib/metrics";
import { readConfig } from "app/lib/links-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

/**
 * Single validated hue for every bar: the bars encode one measure (clicks)
 * across categories, so color carries no identity — the labels do. Validated
 * against both #ffffff and #121212 surfaces.
 */
const BAR = "#3b82f6";

/** `from = null` means all time. Order here is the order of the filter tabs. */
const RANGES = {
  today: { label: "Today", days: 1 },
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
  all: { label: "All time", days: null },
} as const;

type RangeKey = keyof typeof RANGES;

const nf = new Intl.NumberFormat("en-US");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      <div className="text-2xl font-medium text-black dark:text-white tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}

type Row = { id: string; label: string; clicks: number; note?: string };

function BarRow({ row, max }: { row: Row; max: number }) {
  const width = max > 0 ? Math.max((row.clicks / max) * 100, row.clicks > 0 ? 2 : 0) : 0;

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-black dark:text-white truncate">
          {row.label}
          {row.note && (
            <span className="ml-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              {row.note}
            </span>
          )}
        </span>
        <span className="text-sm tabular-nums text-neutral-600 dark:text-neutral-300 flex-none">
          {nf.format(row.clicks)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-r-[4px]"
          style={{ width: `${width}%`, backgroundColor: BAR }}
        />
      </div>
    </li>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  // The layout already gates rendering; this guards the data read itself.
  if (!(await isAdmin())) return null;

  const { range } = await searchParams;
  const rangeKey: RangeKey = range && range in RANGES ? (range as RangeKey) : "all";
  const { label: rangeLabel, days } = RANGES[rangeKey];

  const to = utcDay();
  const from = days === null ? null : utcDayAgo(days - 1);

  const [counters, config] = await Promise.all([readRange(from, to), readConfig()]);
  const knownIds = new Set(config.links.map((link) => link.id));

  const visits = counters[KEY.visits] ?? 0;
  const visitors = counters[KEY.visitors] ?? 0;

  const rows: Row[] = config.links.map((link) => ({
    id: link.id,
    label: link.label,
    clicks: counters[KEY.click(link.id)] ?? 0,
    note: link.enabled === false ? "hidden" : undefined,
  }));

  // Counters whose link was deleted or renamed — still worth showing.
  const orphans: Row[] = Object.entries(counters)
    .filter(
      ([key]) =>
        key.startsWith(CLICK_PREFIX) && !knownIds.has(key.slice(CLICK_PREFIX.length)),
    )
    .map(([key, clicks]) => ({
      id: key,
      label: key.slice(CLICK_PREFIX.length),
      clicks,
      note: "removed",
    }));

  const all = [...rows, ...orphans].sort((a, b) => b.clicks - a.clicks);
  const totalClicks = all.reduce((sum, row) => sum + row.clicks, 0);
  const max = Math.max(0, ...all.map((row) => row.clicks));
  const clickRate = visits > 0 ? (totalClicks / visits) * 100 : 0;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-black dark:text-white">
          Linktree stats
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {rangeLabel} · <span className="font-mono">/links</span>
        </p>
      </div>

      <nav className="flex flex-wrap gap-1 mb-6" aria-label="Date range">
        {(Object.keys(RANGES) as RangeKey[]).map((key) => {
          const active = key === rangeKey;
          return (
            <a
              key={key}
              href={`/admin/stats?range=${key}`}
              aria-current={active ? "page" : undefined}
              className={[
                "rounded-lg px-3 py-1.5 text-sm no-underline transition-colors",
                active
                  ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                  : "border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {RANGES[key].label}
            </a>
          );
        })}
      </nav>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Visits" value={nf.format(visits)} />
        <Stat label="Visitors" value={nf.format(visitors)} />
        <Stat label="Clicks" value={nf.format(totalClicks)} />
        <Stat label="Click rate" value={`${clickRate.toFixed(0)}%`} />
      </div>

      <h2 className="text-sm font-medium text-black dark:text-white mb-4">
        Clicks per link
      </h2>

      {totalClicks === 0 && visits === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 rounded-xl border border-black/10 dark:border-white/10 p-4">
          No data in this range. Open{" "}
          <a href="/links" className="underline underline-offset-4">
            /links
          </a>{" "}
          and tap a button — numbers show up here immediately.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {all.map((row) => (
            <BarRow key={row.id} row={row} max={max} />
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-8 leading-relaxed">
        <strong className="font-medium">Visits</strong> counts every load of
        /links. <strong className="font-medium">Visitors</strong> counts each
        device once. <strong className="font-medium">Click rate</strong> is
        clicks ÷ visits, so it can exceed 100% when people tap more than one
        link. Days are counted in UTC.
      </p>
    </>
  );
}
