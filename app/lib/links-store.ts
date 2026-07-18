import "server-only";
import { supabase } from "./supabase";
import {
  links as seedLinks,
  linksProfile as seedProfile,
  type LinkItem,
  type LinksProfile,
} from "app/links-config";
import { isLinkIcon, type LinkIcon } from "app/links/icon-names";
import { isLinkColor } from "app/links/colors";

export type { LinksProfile };

/**
 * The live Linktree config, edited at /admin/config, stored as a single JSONB
 * row in Supabase (table `link_config`, id = 1).
 *
 * links-config.ts is the seed: until something is saved from the admin UI, the
 * row is empty and /links renders those defaults. After the first save, this
 * row is the source of truth and the file is only used by "Reset to defaults".
 */

const CONFIG_TABLE = "link_config";
const CONFIG_ID = 1;

export type LinksConfig = {
  profile: LinksProfile;
  links: LinkItem[];
};

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
    const icon = str(item.icon);

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
    if (!isLinkIcon(icon)) {
      errors.push(`${position} ("${id}"): unknown icon "${icon}".`);
      return;
    }

    const color = str(item.color);

    seen.add(id);
    links.push({
      id,
      label,
      href,
      icon,
      // Unknown/absent color just falls back to the neutral default.
      color: isLinkColor(color) ? color : undefined,
      description: clamp(str(item.description), LIMITS.description) || undefined,
      enabled: item.enabled !== false,
      featured: item.featured === true,
    });
  });

  return { config: { profile, links }, errors };
}

/** The live config. Falls back to the seed defaults when nothing is saved yet. */
export async function readConfig(): Promise<LinksConfig> {
  try {
    const { data, error } = await supabase()
      .from(CONFIG_TABLE)
      .select("data")
      .eq("id", CONFIG_ID)
      .maybeSingle();
    if (error) throw error;

    const raw = data?.data ?? null;
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

/** Throws on failure so the admin "Save" surfaces a real error, not a silent no-op. */
export async function writeConfig(config: LinksConfig): Promise<void> {
  const { error } = await supabase()
    .from(CONFIG_TABLE)
    .upsert({ id: CONFIG_ID, data: config, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Drops the saved config so /links falls back to links-config.ts again. */
export async function clearConfig(): Promise<void> {
  const { error } = await supabase()
    .from(CONFIG_TABLE)
    .delete()
    .eq("id", CONFIG_ID);
  if (error) throw error;
}

export const visibleLinks = (config: LinksConfig): LinkItem[] =>
  config.links.filter((link) => link.enabled !== false);
