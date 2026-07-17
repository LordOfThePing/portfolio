import "server-only";
import {
  blobStore,
  devFilePath,
  devReadJson,
  devWriteJson,
  withLock,
} from "./blob-store";
import {
  links as seedLinks,
  linksProfile as seedProfile,
  type LinkIcon,
  type LinkItem,
  type LinksProfile,
} from "app/links-config";

export type { LinksProfile };

/**
 * The live Linktree config, edited at /admin/config.
 *
 * links-config.ts is the seed: until something is saved from the admin UI, the
 * store is empty and /links renders those defaults. After the first save, this
 * store is the source of truth and the file is only used by "Reset to defaults".
 */

const STORE_NAME = "linktree-config";
const CONFIG_KEY = "config";
const DEV_FILE = devFilePath("links");
const DEV_LOCK = "__links_dev_file__";

export type LinksConfig = {
  profile: LinksProfile;
  links: LinkItem[];
};

export const ICON_OPTIONS: LinkIcon[] = [
  "cv",
  "email",
  "github",
  "instagram",
  "linkedin",
  "twitter",
  "whatsapp",
  "globe",
  "chart",
  "rocket",
];

export const LIMITS = {
  links: 50,
  id: 32,
  label: 60,
  description: 120,
  name: 80,
  handle: 40,
  bio: 300,
  href: 500,
} as const;

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export const defaultConfig = (): LinksConfig => ({
  profile: { ...seedProfile },
  links: seedLinks.map((link) => ({ ...link })),
});

/**
 * Allowlist of URL schemes. This is the security boundary for the config UI:
 * every href ends up in an <a href>, so a `javascript:` URL saved here would be
 * stored XSS on the public page. Only these four shapes are ever allowed, and
 * an allowlist (rather than blocking "javascript:") also defeats obfuscation
 * like "java\nscript:" and protocol-relative "//evil.com".
 */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (value.startsWith("//")) return false;
  if (value.startsWith("/")) return true;
  return /^(https?:\/\/|mailto:)/i.test(value);
}

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const clamp = (value: string, max: number) => value.slice(0, max);

/**
 * Always returns a usable config, plus a list of what was wrong.
 * Saving rejects when `errors` is non-empty; reading tolerates it and just
 * drops bad entries, so a malformed blob can never take the public page down.
 */
export function validateConfig(input: unknown): {
  config: LinksConfig;
  errors: string[];
} {
  const errors: string[] = [];
  const raw = (input ?? {}) as Partial<LinksConfig>;

  const rawProfile = (raw.profile ?? {}) as Partial<LinksProfile>;
  const name = clamp(str(rawProfile.name), LIMITS.name);
  if (!name) errors.push("Profile name can't be empty.");

  const avatar = clamp(str(rawProfile.avatar), LIMITS.href);
  if (avatar && !isSafeHref(avatar)) {
    errors.push("Avatar must be a path like /fotocv.jpg or an https:// URL.");
  }

  const profile: LinksProfile = {
    avatar: avatar && isSafeHref(avatar) ? avatar : seedProfile.avatar,
    name: name || seedProfile.name,
    handle: clamp(str(rawProfile.handle), LIMITS.handle),
    bio: clamp(str(rawProfile.bio), LIMITS.bio),
  };

  const rawLinks = Array.isArray(raw.links) ? raw.links : [];
  if (rawLinks.length > LIMITS.links) {
    errors.push(`Too many links (max ${LIMITS.links}).`);
  }

  const links: LinkItem[] = [];
  const seen = new Set<string>();

  rawLinks.slice(0, LIMITS.links).forEach((entry, index) => {
    const item = (entry ?? {}) as Partial<LinkItem>;
    const position = `Link ${index + 1}`;

    const id = clamp(str(item.id).toLowerCase(), LIMITS.id);
    const label = clamp(str(item.label), LIMITS.label);
    const href = clamp(str(item.href), LIMITS.href);
    const icon = str(item.icon) as LinkIcon;

    if (!id) {
      errors.push(`${position}: id can't be empty.`);
      return;
    }
    if (!ID_PATTERN.test(id)) {
      errors.push(
        `${position} ("${id}"): id may only use lowercase letters, numbers, - and _.`,
      );
      return;
    }
    if (seen.has(id)) {
      errors.push(`${position} ("${id}"): duplicate id — each must be unique.`);
      return;
    }
    if (!label) {
      errors.push(`${position} ("${id}"): label can't be empty.`);
      return;
    }
    if (!href) {
      errors.push(`${position} ("${id}"): URL can't be empty.`);
      return;
    }
    if (!isSafeHref(href)) {
      errors.push(
        `${position} ("${id}"): URL must start with https://, http://, mailto: or /`,
      );
      return;
    }
    if (!ICON_OPTIONS.includes(icon)) {
      errors.push(`${position} ("${id}"): unknown icon "${icon}".`);
      return;
    }

    seen.add(id);
    links.push({
      id,
      label,
      href,
      icon,
      description: clamp(str(item.description), LIMITS.description) || undefined,
      enabled: item.enabled !== false,
      featured: item.featured === true,
    });
  });

  return { config: { profile, links }, errors };
}

const store = () => blobStore(STORE_NAME);

/** The live config. Falls back to the seed defaults when nothing is saved yet. */
export async function readConfig(): Promise<LinksConfig> {
  try {
    const blobs = store();
    const raw = blobs
      ? await blobs.get(CONFIG_KEY, { type: "json" })
      : await devReadJson<LinksConfig | null>(DEV_FILE, null);

    if (!raw) return defaultConfig();

    const { config, errors } = validateConfig(raw);
    if (errors.length) {
      console.error("[links] stored config had problems:", errors);
    }
    return config;
  } catch (error) {
    console.error("[links] failed to read config, using defaults:", error);
    return defaultConfig();
  }
}

export async function writeConfig(config: LinksConfig): Promise<void> {
  const blobs = store();
  if (!blobs) {
    await withLock(DEV_LOCK, () => devWriteJson(DEV_FILE, config));
    return;
  }
  await withLock(CONFIG_KEY, () => blobs.setJSON(CONFIG_KEY, config));
}

/** Drops the saved config so /links falls back to links-config.ts again. */
export async function clearConfig(): Promise<void> {
  const blobs = store();
  if (!blobs) {
    await withLock(DEV_LOCK, () => devWriteJson(DEV_FILE, null));
    return;
  }
  await withLock(CONFIG_KEY, () => blobs.delete(CONFIG_KEY));
}

export const visibleLinks = (config: LinksConfig): LinkItem[] =>
  config.links.filter((link) => link.enabled !== false);
