import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { recordClick } from "app/lib/metrics";
import {
  findLink,
  findList,
  isSafeHref,
  listLinks,
  readConfig,
} from "app/lib/links-store";
import LinksClient, { type RenderedLink } from "../links-client";
import { renderChild, renderLink } from "../render";

/**
 * Direct-share endpoint for a single button: /links/<button-id>.
 *
 * Leaf links: counts a click on that id and 307s to its URL — share
 * /links/github and every visit shows up under GitHub's clicks.
 *
 * Group links (links with children): render a chooser page listing every
 * destination, so one Instagram link lets the visitor pick their platform.
 *
 * The `hidden` flag only controls visibility on /links — direct share URLs
 * keep working either way, which is the whole point of hiding a link: use it
 * from a QR code or a specific channel without putting it in the public list.
 *
 * Custom lists (their own header + pick of links) also live here. Validation
 * keeps list ids and link ids apart, so the lookup order never matters.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const config = await readConfig();
  const link = findLink(config, id);

  const list = link ? undefined : findList(config, id);
  if (list) {
    return {
      title: list.profile.name,
      description: list.profile.bio || undefined,
      // Lists are usually made for one audience; opt in to search engines.
      robots: list.indexed ? undefined : { index: false, follow: false },
      openGraph: {
        title: `${list.profile.name} — Links`,
        description: list.profile.bio || undefined,
        url: `/links/${list.id}`,
        type: "profile",
      },
    };
  }

  if (!link?.children?.length) return { robots: { index: false, follow: false } };

  return {
    title: link.label,
    description: link.description ?? config.profile.bio,
    // Hidden groups still serve their chooser, but shouldn't show up in Google
    // — "hidden" is for QR codes and direct shares, not for the public index.
    robots:
      link.enabled === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${config.profile.name} — ${link.label}`,
      description: link.description ?? config.profile.bio,
      url: `/links/${link.id}`,
      type: "profile",
    },
  };
}

export default async function LinkDirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const config = await readConfig();
  const link = findLink(config, id);

  if (!link) {
    const list = findList(config, id);
    if (!list) redirect("/links");

    return (
      <section className="py-4">
        <LinksClient
          links={listLinks(config, list).map(renderLink)}
          profile={list.profile}
          list={list.id}
        />
      </section>
    );
  }

  // Group: render the chooser. Count a click on the group id so the share
  // link has the same analytic weight as any other button.
  if (link.children?.length) {
    await recordClick(link.id);

    const children: RenderedLink[] = link.children.map((child) =>
      renderChild(link.id, child),
    );

    const profile = {
      ...config.profile,
      name: link.label,
      handle: "",
      bio: link.description ?? "Elegí una opción:",
    };

    return (
      <section className="py-4">
        <LinksClient links={children} profile={profile} trackVisit={false} />
      </section>
    );
  }

  // Leaf: redirect through to the destination.
  if (!isSafeHref(link.href)) redirect("/links");

  await recordClick(link.id);
  redirect(link.href);
}
