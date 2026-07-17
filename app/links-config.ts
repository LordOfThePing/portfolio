import { socialLinks } from "./config";

/**
 * ============================================================================
 *  LINKTREE CONFIG  —  this is the only file you need to edit.
 * ============================================================================
 *
 *  TO ADD a link:     copy a block below, paste it, change the fields.
 *  TO REMOVE a link:  delete its block  (or set `enabled: false` to hide it
 *                     without losing its click stats).
 *  TO REORDER:        drag the blocks up or down — display order = this order.
 *
 *  ⚠️  The `id` is the key your click stats are stored under.
 *      Renaming an id starts its counter over from zero. Everything else
 *      (label, href, icon, order) is safe to change at any time.
 */

export type LinkIcon =
  | "cv"
  | "email"
  | "github"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "whatsapp"
  | "globe"
  | "chart"
  | "rocket";

export type LinkItem = {
  /** Stable key for click stats. Lowercase, no spaces. Don't change once live. */
  id: string;
  /** Big text on the button. */
  label: string;
  /** Small grey text under the label. Optional. */
  description?: string;
  href: string;
  icon: LinkIcon;
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
  bio: "FullStack Engineer at Globant. Computer Engineer (UBA). I build things for the web.",
};

export const links: LinkItem[] = [
  {
    id: "vuelto",
    label: "Vuelto App",
    description: "Track your finances from WhatsApp",
    href: "https://mivuelto.com/",
    icon: "globe",
    featured: true,
  },
  {
    id: "cv",
    label: "Resume / CV",
    description: "PDF, always up to date",
    href: socialLinks.cv,
    icon: "cv",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Projects and source code",
    href: socialLinks.github,
    icon: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Let's connect",
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
    description: "Real-time prices and portfolio",
    href: "http://tracker.flynnpedroa.engineer/",
    icon: "chart",
  },
  {
    id: "portfolio",
    label: "Full Portfolio",
    description: "Everything I've built",
    href: "/",
    icon: "rocket",
  },
  {
    id: "email",
    label: "Email me",
    description: "Available for freelance work",
    href: socialLinks.email,
    icon: "email",
  },
];

/** Only the links that should actually render, in order. */
export const visibleLinks = () => links.filter((l) => l.enabled !== false);
