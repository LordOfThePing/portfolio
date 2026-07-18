import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for the /links backend (metrics + config).
 *
 * We connect with the SERVICE ROLE key, which bypasses row-level security. That
 * key must NEVER reach the browser, so this module is `server-only` and the env
 * vars are plain (no NEXT_PUBLIC_ prefix) — Next.js only exposes NEXT_PUBLIC_*
 * to the client, so these can't leak into the bundle.
 *
 * Unlike Netlify Blobs' short-lived token, the service key is static, so caching
 * one client at module scope is safe and avoids rebuilding it per request.
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => Boolean(url && serviceKey);

/**
 * Turns a Supabase/PostgREST error (a plain object, so `${error}` prints the
 * useless "[object Object]") into a readable one-line message with the code.
 */
export function describeError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const parts = [
      e.message,
      e.details,
      e.hint,
      e.code ? `(code ${e.code})` : null,
    ].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return String(error);
}

export function supabase(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
