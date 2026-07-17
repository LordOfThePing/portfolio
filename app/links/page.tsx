import type { Metadata } from "next";
import { readConfig, visibleLinks } from "app/lib/links-store";
import LinksClient from "./links-client";

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

  return (
    <section className="py-4">
      <LinksClient links={visibleLinks(config)} profile={config.profile} />
    </section>
  );
}
