import type { CSSProperties } from "react";

/**
 * Preset icon-background colors, chosen in /admin/config.
 *
 * Stored as a key ("blue"), never a raw hex value — so nothing user-entered
 * ends up in a style attribute, and the swatches stay consistent. Each color is
 * rendered as a translucent tint behind a solid-color icon, which reads well in
 * both light and dark themes without per-theme values.
 */
export const LINK_COLORS = {
  default: { label: "Default", fg: null },
  blue: { label: "Blue", fg: "#3b82f6" },
  sky: { label: "Sky", fg: "#0ea5e9" },
  teal: { label: "Teal", fg: "#14b8a6" },
  green: { label: "Green", fg: "#22c55e" },
  lime: { label: "Lime", fg: "#84cc16" },
  amber: { label: "Amber", fg: "#f59e0b" },
  orange: { label: "Orange", fg: "#f97316" },
  red: { label: "Red", fg: "#ef4444" },
  pink: { label: "Pink", fg: "#ec4899" },
  purple: { label: "Purple", fg: "#a855f7" },
  indigo: { label: "Indigo", fg: "#6366f1" },
} as const;

export type LinkColor = keyof typeof LINK_COLORS;

export const LINK_COLOR_KEYS = Object.keys(LINK_COLORS) as LinkColor[];

export const isLinkColor = (value: string): value is LinkColor =>
  value in LINK_COLORS;

/**
 * Inline style for the icon chip, or undefined for "default" (fall back to the
 * neutral/featured classes). `24` is ~14% alpha for the tinted background.
 */
export function iconColorStyle(color?: string): CSSProperties | undefined {
  if (!color || !isLinkColor(color)) return undefined;
  const fg = LINK_COLORS[color].fg;
  if (!fg) return undefined;
  return { backgroundColor: `${fg}24`, color: fg };
}
