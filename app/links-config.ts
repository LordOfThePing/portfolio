import { socialLinks } from "./config";
import type { LinkIcon } from "./links/icon-names";
import type { LinkColor } from "./links/colors";

export type { LinkIcon };

/**
 * ============================================================================
 *  LINKTREE SEED DEFAULTS
 * ============================================================================
 *
 *  ⚠️  This file is only the STARTING POINT. Once you save anything at
 *      /admin/config, that saved version takes over and this file is ignored
 *      — except by "Reset to defaults", which restores exactly what's here.
 *
 *  So: edit your live links at /admin/config, not here. Edit this file when you
 *      want to change what "Reset to defaults" gives you back.
 *
 *  The `id` is the button id: it's the key click stats are stored under AND
 *  the direct-link path (/links/<id>). Renaming it starts its counter over and
 *  breaks any direct link you've shared. Everything else is safe to change.
 *
 *  Icon names: see app/links/icon-names.ts for the full list (~210).
 *  Colors: see app/links/colors.ts.
 */

export type LinkItem = {
  /**
   * Button id: click-stats key and direct-link path (/links/<id>).
   * Lowercase, no spaces. Don't change once live.
   */
  id: string;
  /** Big text on the button. */
  label: string;
  /** Small grey text under the label. Optional. */
  description?: string;
  href: string;
  icon: LinkIcon;
  /** Icon background color preset. Omit for the neutral default. */
  color?: LinkColor;
  /** Set false to hide the button but keep its stats. Defaults to true. */
  enabled?: boolean;
  /** Highlights the button to draw the eye. Use on 1–2 links, max. */
  featured?: boolean;
};

export type LinksProfile = {
  avatar: string;
  name: string;
  handle: string;
  bio: string;
};

/** Header shown above the buttons. */
export const linksProfile: LinksProfile = {
  avatar: "/fotocv.jpg",
  name: "Pedro Andrés Flynn",
  handle: "@pepeflynn",
  bio: "Ingeniero FullStack en Globant. Ingeniero en Informática (UBA). Construyo cosas para la web.",
};

export const links: LinkItem[] = [
  {
    id: "vuelto",
    label: "Vuelto App",
    description: "Controlá tus finanzas desde WhatsApp",
    href: "https://mivuelto.com/",
    icon: "globe",
    featured: true,
  },
  {
    id: "cv",
    label: "Mi CV",
    description: "PDF, siempre actualizado",
    href: socialLinks.cv,
    icon: "cv",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Proyectos y código fuente",
    href: socialLinks.github,
    icon: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Conectemos",
    href: socialLinks.linkedin,
    icon: "linkedin",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    href: socialLinks.twitter,
    icon: "twitter",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: socialLinks.instagram,
    icon: "instagram",
  },
  {
    id: "tracker",
    label: "Stock & Crypto Tracker",
    description: "Precios en tiempo real y portafolio",
    href: "http://tracker.flynnpedroa.engineer/",
    icon: "chart",
  },
  {
    id: "portfolio",
    label: "Portfolio completo",
    description: "Todo lo que construí",
    href: "/",
    icon: "rocket",
  },
  {
    id: "email",
    label: "Escribime",
    description: "Disponible para trabajos freelance",
    href: socialLinks.email,
    icon: "email",
  },
];
