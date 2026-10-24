import type { ChildLink, LinkItem } from "app/links-config";
import { ICON_META } from "./icons";
import { iconColorStyle } from "./colors";
import type { RenderedLink } from "./links-client";

/**
 * Icons are resolved and rendered here, on the server, so react-icons stays
 * out of the browser bundle — only the SVGs on the page are sent.
 */
export function renderChild(parentId: string, child: ChildLink): RenderedLink {
  const { Icon } = ICON_META[child.icon] ?? ICON_META.globe;
  return {
    // The track endpoint accepts this composite form; see api/links/track.
    id: `${parentId}:${child.id}`,
    label: child.label,
    description: child.description,
    href: child.href,
    icon: <Icon aria-hidden="true" />,
    iconStyle: iconColorStyle(child.color),
  };
}

export function renderLink(link: LinkItem): RenderedLink {
  const { Icon } = ICON_META[link.icon] ?? ICON_META.globe;
  const children = link.children?.map((child) => renderChild(link.id, child));
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
}
