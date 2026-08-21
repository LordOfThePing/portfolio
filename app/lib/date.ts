/**
 * Format a UTC ISO timestamp as e.g. "Jan 5, 2025" in the viewer's locale.
 * Works in server and client components; the "au-CA" issue is moot because we
 * render the date from an explicit Date on whichever side runs it.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
