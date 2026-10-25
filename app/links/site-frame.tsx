/** Which parts of the site frame (root layout) a links page hides. */
export type SiteFrame = { header?: boolean; footer?: boolean };

/**
 * Marker for global.css: while it's on the page, the layout's header and/or
 * footer are hidden. The layout can't know which list a page belongs to, so
 * the page says it instead.
 */
export function HideSiteFrame({ header, footer }: SiteFrame) {
  if (!header && !footer) return null;
  return (
    <span
      hidden
      data-hide-header={header || undefined}
      data-hide-footer={footer || undefined}
    />
  );
}
