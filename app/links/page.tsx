import type { Metadata } from "next";
import { readConfig, visibleLinks } from "app/lib/links-store";
import LinksClient, { type RenderedLink } from "./links-client";
import { renderLink } from "./render";
import { HideSiteFrame } from "./site-frame";

/**
 * Rendered per request so edits made in /admin/config are live immediately,
 * with no cache to reason about. The page is a handful of buttons plus one
 * Blobs read, so this stays fast.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await readConfig();
  return {
    title: "Links",
    description: profile.bio,
    openGraph: {
      title: `${profile.name} — Links`,
      description: profile.bio,
      url: "/links",
      type: "profile",
    },
  };
}

export default async function LinksPage() {
  const config = await readConfig();

  const links: RenderedLink[] = visibleLinks(config).map(renderLink);

  return (
    <section className="py-4">
      {/* /links is a standalone bio-link page: never the portfolio header. */}
      <HideSiteFrame header footer={config.hideFooter} />
      <LinksClient links={links} profile={config.profile} />
    </section>
  );
}
