import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findList, findListLink, readConfig } from "app/lib/links-store";
import { directLinkMetadata, serveDirectLink } from "../../direct";

/** /links/<list>/<id>: direct share of one of a custom list's own buttons. */
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string; item: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, item } = await params;
  const list = findList(await readConfig(), id);
  const link = list && findListLink(list, item);
  if (!list || !link) return { robots: { index: false, follow: false } };

  return directLinkMetadata(link, list.profile, `/links/${list.id}/${link.id}`, list.indexed);
}

export default async function ListLinkPage({ params }: { params: Params }) {
  const { id, item } = await params;
  const list = findList(await readConfig(), id);
  if (!list) redirect("/links");

  const home = `/links/${list.id}`;
  const link = findListLink(list, item);
  if (!link) redirect(home);

  return serveDirectLink(link, list.profile, { home, list: list.id });
}
