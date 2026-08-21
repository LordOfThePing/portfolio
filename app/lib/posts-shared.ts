/**
 * Client-safe types + pure helpers shared by the server store and the admin
 * editor. Deliberately avoids "server-only" and node builtins so the editor
 * can import it without dragging the Supabase/crypto modules into the browser.
 */

export type PostVisibility = "public" | "private";

export type PostDraft = {
  slug: string;
  title: string;
  excerpt: string;
  visibility: PostVisibility;
  bodyMd: string;
};

export const POST_LIMITS = {
  slug: 120,
  title: 200,
  excerpt: 400,
  body: 400_000,
  list: 200,
} as const;

/** Normalize a phrase into a url-safe slug. Accents are stripped (Diseño -> diseno). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, POST_LIMITS.slug);
}
