import type { Metadata } from "next";
import { readConfig, visibleLinks } from "app/lib/links-store";
import { ICON_META } from "./icons";
import { iconColorStyle } from "./colors";
import LinksClient, { type RenderedLink } from "./links-client";

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

  // Icons are resolved and rendered here, on the server, so react-icons stays
  // out of the browser bundle — only the SVGs on the page are sent.
  const links: RenderedLink[] = visibleLinks(config).map((link) => {
    const { Icon } = ICON_META[link.icon] ?? ICON_META.globe;
    const children = link.children?.map((child) => {
      const ChildIcon = (ICON_META[child.icon] ?? ICON_META.globe).Icon;
      return {
        id: `${link.id}:${child.id}`,
        label: child.label,
        description: child.description,
        href: child.href,
        icon: <ChildIcon aria-hidden="true" />,
        iconStyle: iconColorStyle(child.color),
      } satisfies RenderedLink;
    });
    return {
      id: link.id,
      label: link.label,
      description: link.description,
      href: link.href,
      featured: link.featured,
      icon: <Icon aria-hidden="true" />,
      iconStyle: iconColorStyle(link.color),
      children: children && children.length > 0 ? children : undefined,
    };
  });

  return (
    <section className="py-4">
      <LinksClient links={links} profile={config.profile} />
    </section>
  );
}
