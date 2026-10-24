import "server-only";
import { describeError, supabase } from "./supabase";
import {
  links as seedLinks,
  linksProfile as seedProfile,
  lists as seedLists,
  type ChildLink,
  type LinkItem,
  type LinksList,
  type LinksProfile,
} from "app/links-config";
import { isLinkIcon, type LinkIcon } from "app/links/icon-names";
import { isLinkColor } from "app/links/colors";

export type { LinksList, LinksProfile };

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
  lists: LinksList[];
};

export const LIMITS = {
  links: 50,
  children: 15,
  lists: 20,
  id: 32,
  label: 60,
  description: 120,
  name: 80,
  handle: 40,
  bio: 300,
  href: 500,
} as const;

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

/**
 * List ids that are never allowed. "default" is how stats name the Default
 * list (events with no list), so a custom list can't take it.
 */
const RESERVED_LIST_IDS = new Set(["default"]);

export const defaultConfig = (): LinksConfig => ({
  profile: { ...seedProfile },
  links: seedLinks.map((link) => ({ ...link })),
  lists: seedLists.map((list) => ({
    ...list,
    profile: { ...list.profile },
    show: [...list.show],
  })),
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
    if (!isLinkIcon(icon)) {
      errors.push(`${position} ("${id}"): unknown icon "${icon}".`);
      return;
    }

    const rawChildren = Array.isArray(item.children) ? item.children : [];
    const hasChildren = rawChildren.length > 0;
    const children: ChildLink[] = [];

    if (hasChildren) {
      if (rawChildren.length > LIMITS.children) {
        errors.push(
          `${position} ("${id}"): too many destinations (max ${LIMITS.children}).`,
        );
      }
      const seenChild = new Set<string>();
      rawChildren.slice(0, LIMITS.children).forEach((childEntry, childIndex) => {
        const child = (childEntry ?? {}) as Partial<ChildLink>;
        const childPos = `${position} ("${id}") destination ${childIndex + 1}`;

        const childId = clamp(str(child.id).toLowerCase(), LIMITS.id);
        const childLabel = clamp(str(child.label), LIMITS.label);
        const childHref = clamp(str(child.href), LIMITS.href);
        const childIcon = str(child.icon);
        const childColor = str(child.color);

        if (!childId) {
          errors.push(`${childPos}: id can't be empty.`);
          return;
        }
        if (!ID_PATTERN.test(childId)) {
          errors.push(
            `${childPos} ("${childId}"): id may only use lowercase letters, numbers, - and _.`,
          );
          return;
        }
        if (seenChild.has(childId)) {
          errors.push(
            `${childPos} ("${childId}"): duplicate id within the group.`,
          );
          return;
        }
        if (!childLabel) {
          errors.push(`${childPos} ("${childId}"): label can't be empty.`);
          return;
        }
        if (!childHref) {
          errors.push(`${childPos} ("${childId}"): URL can't be empty.`);
          return;
        }
        if (!isSafeHref(childHref)) {
          errors.push(
            `${childPos} ("${childId}"): URL must start with https://, http://, mailto: or /`,
          );
          return;
        }
        if (!isLinkIcon(childIcon)) {
          errors.push(
            `${childPos} ("${childId}"): unknown icon "${childIcon}".`,
          );
          return;
        }

        seenChild.add(childId);
        children.push({
          id: childId,
          label: childLabel,
          href: childHref,
          icon: childIcon,
          color: isLinkColor(childColor) ? childColor : undefined,
          description:
            clamp(str(child.description), LIMITS.description) || undefined,
        });
      });
    } else {
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
    }

    const color = str(item.color);

    seen.add(id);
    links.push({
      id,
      label,
      // A group's `href` is unused; store it as empty rather than carrying
      // whatever placeholder the editor had.
      href: hasChildren ? "" : href,
      icon,
      // Unknown/absent color just falls back to the neutral default.
      color: isLinkColor(color) ? color : undefined,
      description: clamp(str(item.description), LIMITS.description) || undefined,
      enabled: item.enabled !== false,
      featured: item.featured === true,
      children: children.length > 0 ? children : undefined,
    });
  });

  const lists = validateLists(raw.lists, links, errors);

  return { config: { profile, links, lists }, errors };
}

/**
 * Lists are checked against the already-validated links. Ids in `show` that
 * no longer exist (link deleted or renamed) are dropped silently — that's an
 * expected side effect of editing the pool, not an error.
 */
function validateLists(
  input: unknown,
  links: LinkItem[],
  errors: string[],
): LinksList[] {
  const rawLists = Array.isArray(input) ? input : [];
  if (rawLists.length > LIMITS.lists) {
    errors.push(`Too many lists (max ${LIMITS.lists}).`);
  }

  const linkIds = new Set(links.map((link) => link.id));
  const lists: LinksList[] = [];
  const seen = new Set<string>();

  rawLists.slice(0, LIMITS.lists).forEach((entry, index) => {
    const item = (entry ?? {}) as Partial<LinksList>;
    const position = `List ${index + 1}`;

    const id = clamp(str(item.id).toLowerCase(), LIMITS.id);
    if (!id) {
      errors.push(`${position}: URL slug can't be empty.`);
      return;
    }
    if (!ID_PATTERN.test(id)) {
      errors.push(
        `${position} ("${id}"): slug may only use lowercase letters, numbers, - and _.`,
      );
      return;
    }
    if (RESERVED_LIST_IDS.has(id)) {
      errors.push(`${position} ("${id}"): "${id}" is reserved — pick another slug.`);
      return;
    }
    if (linkIds.has(id)) {
      errors.push(
        `${position} ("${id}"): a link already uses /links/${id} — pick another slug.`,
      );
      return;
    }
    if (seen.has(id)) {
      errors.push(`${position} ("${id}"): duplicate slug — each list needs its own.`);
      return;
    }

    const rawProfile = (item.profile ?? {}) as Partial<LinksProfile>;
    const name = clamp(str(rawProfile.name), LIMITS.name);
    if (!name) {
      errors.push(`${position} ("${id}"): name can't be empty.`);
      return;
    }
    const avatar = clamp(str(rawProfile.avatar), LIMITS.href);
    if (avatar && !isSafeHref(avatar)) {
      errors.push(
        `${position} ("${id}"): avatar must be a path like /fotocv.jpg or an https:// URL.`,
      );
      return;
    }

    const rawShow = Array.isArray(item.show) ? item.show : [];
    const show = Array.from(new Set(rawShow.map(str))).filter((linkId) =>
      linkIds.has(linkId),
    );

    seen.add(id);
    lists.push({
      id,
      profile: {
        // Unlike the Default profile, an empty avatar is allowed: no photo.
        avatar,
        name,
        handle: clamp(str(rawProfile.handle), LIMITS.handle),
        bio: clamp(str(rawProfile.bio), LIMITS.bio),
      },
      show,
      indexed: item.indexed === true,
    });
  });

  return lists;
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
  if (error) throw new Error(describeError(error));
}

/** Drops the saved config so /links falls back to links-config.ts again. */
export async function clearConfig(): Promise<void> {
  const { error } = await supabase()
    .from(CONFIG_TABLE)
    .delete()
    .eq("id", CONFIG_ID);
  if (error) throw new Error(describeError(error));
}

export const visibleLinks = (config: LinksConfig): LinkItem[] =>
  config.links.filter((link) => link.enabled !== false);

export const findLink = (config: LinksConfig, id: string): LinkItem | undefined =>
  config.links.find((link) => link.id === id);

export const findList = (config: LinksConfig, id: string): LinksList | undefined =>
  config.lists.find((list) => list.id === id);

/** The links a custom list shows, in the list's own order. */
export const listLinks = (config: LinksConfig, list: LinksList): LinkItem[] =>
  list.show.flatMap((id) => findLink(config, id) ?? []);

export const findChild = (
  parent: LinkItem,
  childId: string,
): ChildLink | undefined => parent.children?.find((child) => child.id === childId);
