import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { recordClick } from "app/lib/metrics";
import { findLink, isSafeHref, readConfig } from "app/lib/links-store";
import { ICON_META } from "../icons";
import { iconColorStyle } from "../colors";
import LinksClient, { type RenderedLink } from "../links-client";

/**
 * Direct-share endpoint for a single button: /links/<button-id>.
 *
 * Leaf links: counts a click on that id and 307s to its URL — share
 * /links/github and every visit shows up under GitHub's clicks.
 *
 * Group links (links with children): render a chooser page listing every
 * destination, so one Instagram link lets the visitor pick their platform.
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
  if (!link?.children?.length) return { robots: { index: false, follow: false } };

  return {
    title: link.label,
    description: link.description ?? config.profile.bio,
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

  if (!link || link.enabled === false) redirect("/links");

  // Group: render the chooser. Count a click on the group id so the share
  // link has the same analytic weight as any other button.
  if (link.children?.length) {
    await recordClick(link.id);

    const children: RenderedLink[] = link.children.map((child) => {
      const { Icon } = ICON_META[child.icon] ?? ICON_META.globe;
      return {
        // The track endpoint accepts this composite form; see api/links/track.
        id: `${link.id}:${child.id}`,
        label: child.label,
        description: child.description,
        href: child.href,
        icon: <Icon aria-hidden="true" />,
        iconStyle: iconColorStyle(child.color),
      };
    });

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
