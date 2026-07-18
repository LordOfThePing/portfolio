import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "app/lib/metrics";
import { isSafeHref, readConfig } from "app/lib/links-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Direct share link for a single button: /links/<button-id>.
 *
 * Counts a click on that button (same counter the Stats page reads) and
 * redirects straight to its URL. Share e.g. /links/github and every visit
 * shows up under GitHub's clicks — no need to land on /links first.
 *
 * Unknown or deleted ids fall back to /links so a stale share link is never a
 * dead end. The href was allowlist-validated when saved, but we re-check here
 * because this endpoint issues the redirect itself.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { links } = await readConfig();
  const link = links.find((item) => item.id === id);

  if (!link || !isSafeHref(link.href)) {
    return NextResponse.redirect(new URL("/links", request.url));
  }

  await recordClick(link.id);

  // Internal paths ("/", "/foo") resolve against this origin; external URLs
  // (https, mailto) pass through unchanged.
  const target = link.href.startsWith("/")
    ? new URL(link.href, request.url)
    : link.href;

  return NextResponse.redirect(target);
}
