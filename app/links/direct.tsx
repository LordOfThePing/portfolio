import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { LinkItem, LinksProfile } from "app/links-config";
import { recordClick } from "app/lib/metrics";
import { isSafeHref } from "app/lib/links-store";
import LinksClient from "./links-client";
import { renderChild } from "./render";
import { HideSiteFrame, type SiteFrame } from "./site-frame";

/**
 * Direct share of a single button, shared by /links/<id> (Default list) and
 * /links/<list>/<id> (a custom list's own links).
 *
 * Leaf links: counts a click on that id and 307s to its URL — share
 * /links/github and every visit shows up under GitHub's clicks.
 *
 * Group links (links with children): render a chooser page listing every
 * destination, so one Instagram link lets the visitor pick their platform.
 *
 * The `hidden` flag only controls visibility on the list page — direct share
 * URLs keep working either way, which is the whole point of hiding a link: use
 * it from a QR code or a specific channel without putting it in the list.
 */

export function directLinkMetadata(
  link: LinkItem,
  profile: LinksProfile,
  path: string,
  /** Custom lists are noindex unless opted in; their choosers follow suit. */
  indexable = true,
): Metadata {
  if (!link.children?.length) return { robots: { index: false, follow: false } };

  return {
    title: link.label,
    description: link.description ?? profile.bio,
    // Hidden groups still serve their chooser, but shouldn't show up in Google
    // — "hidden" is for QR codes and direct shares, not for the public index.
    robots:
      link.enabled === false || !indexable ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${profile.name} — ${link.label}`,
      description: link.description ?? profile.bio,
      url: path,
      type: "profile",
    },
  };
}

export async function serveDirectLink(
  link: LinkItem,
  profile: LinksProfile,
  {
    home,
    list,
    frame,
  }: {
    /** Where to send visitors if the link can't be served. */
    home: string;
    /** Custom list id, for stats. */
    list?: string;
    /** What the chooser hides of the site frame — same as its list page. */
    frame: SiteFrame;
  },
) {
  // Group: render the chooser. Count a click on the group id so the share
  // link has the same analytic weight as any other button.
  if (link.children?.length) {
    await recordClick(link.id, list);

    const chooserProfile = {
      ...profile,
      name: link.label,
      handle: "",
      bio: link.description ?? "Elegí una opción:",
    };

    return (
      <section className="py-4">
        <HideSiteFrame {...frame} />
        <LinksClient
          links={link.children.map((child) => renderChild(link.id, child))}
          profile={chooserProfile}
          trackVisit={false}
          list={list}
        />
      </section>
    );
  }

  // Leaf: redirect through to the destination.
  if (!isSafeHref(link.href)) redirect(home);

  await recordClick(link.id, list);
  redirect(link.href);
}
