import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findLink, findList, readConfig, visibleLinks } from "app/lib/links-store";
import LinksClient from "../links-client";
import { renderLink } from "../render";
import { directLinkMetadata, serveDirectLink } from "../direct";
import { HideSiteFrame } from "../site-frame";

/**
 * /links/<id> is either a Default-list button's direct share (see direct.tsx)
 * or a custom list's page. Validation keeps list slugs and Default link ids
 * apart, so the lookup order never matters.
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
  if (link) return directLinkMetadata(link, config.profile, `/links/${link.id}`);

  const list = findList(config, id);
  if (!list) return { robots: { index: false, follow: false } };

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

export default async function LinkOrListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const config = await readConfig();

  const link = findLink(config, id);
  if (link) {
    return serveDirectLink(link, config.profile, {
      home: "/links",
      frame: { header: true, footer: config.hideFooter },
    });
  }

  const list = findList(config, id);
  if (!list) redirect("/links");

  return (
    <section className="py-4">
      <HideSiteFrame header={list.hideHeader} footer={list.hideFooter} />
      <LinksClient
        links={visibleLinks(list).map(renderLink)}
        profile={list.profile}
        list={list.id}
      />
    </section>
  );
}
