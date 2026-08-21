import "server-only";
import crypto from "node:crypto";
import { describeError, supabase } from "./supabase";
import {
  POST_LIMITS,
  slugify,
  type PostDraft,
  type PostVisibility,
} from "./posts-shared";

// Re-export the client-safe pieces so callers can import from one module.
export { POST_LIMITS, slugify };
export type { PostDraft, PostVisibility };

/**
 * Blog backend — Markdown posts edited at /admin/blog and stored in the
 * `blog_posts` table (see supabase/schema.sql).
 *
 * Two visibility levels:
 *   - public  -> listed on /blog, rendered at /blog/<slug>.
 *   - private -> never listed; rendered only at the secret path
 *                /blog/p/<token>. Each post carries a random 32-char token so
 *                a single unguessable link can share it (e.g. a job proposal).
 *
 * Every row is inserted with a random token up front (never derived from the
 * slug), so private posts can't be guessed by path.
 */

const TABLE = "blog_posts";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  visibility: PostVisibility;
  token: string;
  bodyMd: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 32 hex chars (128 bits). Good enough for sharing a single private doc. */
function newToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/** Strip `token` before a post ever leaves the server for public rendering. */
function toPublic(post: BlogPost): Omit<BlogPost, "token"> {
  const { token: _token, ...rest } = post;
  return rest;
}

/** Map a raw DB row to our typed shape. */
function rowToPost(row: Record<string, unknown>): BlogPost {
  return {
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    visibility: (row.visibility === "private" ? "private" : "public"),
    token: String(row.token ?? ""),
    bodyMd: String(row.body_md ?? ""),
    publishedAt: row.published_at ? String(row.published_at) : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

/**
 * Returns a usable draft with a normalization fix-up list. Saving rejects when
 * errors is non-empty; reading from the admin can still load a malformed row.
 */
export function validateDraft(input: unknown): { draft: PostDraft; errors: string[] } {
  const errors: string[] = [];
  const raw = (input ?? {}) as Partial<PostDraft>;

  const title = String(raw.title ?? "").trim().slice(0, POST_LIMITS.title);
  const excerpt = String(raw.excerpt ?? "").trim().slice(0, POST_LIMITS.excerpt);
  const bodyMd = String(raw.bodyMd ?? "").slice(0, POST_LIMITS.body);

  const rawSlug = String(raw.slug ?? "").trim().toLowerCase().slice(0, POST_LIMITS.slug);
  const derived = slugify(title);
  let slug = rawSlug || derived;
  if (!SLUG_PATTERN.test(slug)) {
    errors.push("Slug may only use lowercase letters, numbers and single dashes.");
  }

  if (!title) errors.push("Title can't be empty.");
  if (!bodyMd.trim()) errors.push("Body can't be empty.");

  const visibility: PostVisibility = raw.visibility === "private" ? "private" : "public";

  return {
    draft: { slug, title, excerpt, visibility, bodyMd },
    errors,
  };
}

/** The list shown on /blog — public posts only, newest first, no body/token. */
export async function listPublicPosts(): Promise<
  { id: number; slug: string; title: string; excerpt: string; publishedAt: string }[]
> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("id, slug, title, excerpt, published_at")
    .eq("visibility", "public")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(POST_LIMITS.list);
  if (error) throw new Error(describeError(error));
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    publishedAt: String(row.published_at),
  }));
}

/** Public post full body by slug, or null. Token is never returned. */
export async function getPublicPostBySlug(
  slug: string,
): Promise<(Omit<BlogPost, "token"> & { token: null }) | null> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "public")
    .not("published_at", "is", null)
    .maybeSingle();
  if (error) throw new Error(describeError(error));
  if (!data) return null;
  const post = rowToPost(data);
  return { ...toPublic(post), token: null };
}

/** Any post whose share token matches — public OR private. Used for /blog/p/<token>. */
export async function getPostByToken(
  token: string,
): Promise<BlogPost | null> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .eq("token", token)
    .not("published_at", "is", null)
    .maybeSingle();
  if (error) throw new Error(describeError(error));
  if (!data) return null;
  return rowToPost(data);
}

/* ---------------------------------------------------------------------------
 * Admin-only reads/writes. Every function here is called from a server page or
 * server action that already passed isAdmin(), so we don't re-check here.
 * --------------------------------------------------------------------------- */

/** All posts (any visibility, drafts included) for the admin editor. */
export async function listAllPosts(): Promise<
  { id: number; slug: string; title: string; excerpt: string; visibility: PostVisibility; publishedAt: string | null; token: string }[]
> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("id, slug, title, excerpt, visibility, published_at, token")
    .order("created_at", { ascending: false })
    .limit(POST_LIMITS.list);
  if (error) throw new Error(describeError(error));
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    visibility: row.visibility === "private" ? "private" : "public",
    publishedAt: row.published_at ? String(row.published_at) : null,
    token: String(row.token ?? ""),
  }));
}

/** A single post by id for editing, or null. */
export async function getPostById(id: number): Promise<BlogPost | null> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(describeError(error));
  if (!data) return null;
  return rowToPost(data);
}

/** Insert a new post (publishes immediately). */
export async function insertPost(draft: PostDraft): Promise<BlogPost> {
  const { data, error } = await supabase()
    .from(TABLE)
    .insert({
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      visibility: draft.visibility,
      token: newToken(),
      body_md: draft.bodyMd,
      published_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(describeError(error));
  return rowToPost(data!);
}

export async function updatePost(id: number, draft: PostDraft): Promise<void> {
  const { error } = await supabase()
    .from(TABLE)
    .update({
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      visibility: draft.visibility,
      body_md: draft.bodyMd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(describeError(error));
}

export async function deletePost(id: number): Promise<void> {
  const { error } = await supabase()
    .from(TABLE)
    .delete()
    .eq("id", id);
  if (error) throw new Error(describeError(error));
}

/** True only if the slug is taken by ANOTHER post (the one with `exceptId` excluded). */
export async function slugTaken(
  slug: string,
  exceptId: number | null = null,
): Promise<boolean> {
  let q = supabase().from(TABLE).select("id").eq("slug", slug);
  if (exceptId !== null) q = q.neq("id", exceptId);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(describeError(error));
  return Boolean(data);
}
