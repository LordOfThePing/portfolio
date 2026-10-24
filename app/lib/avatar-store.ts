import "server-only";
import { randomUUID } from "node:crypto";
import { describeError, supabase } from "./supabase";

/**
 * Profile photos for /links and custom lists, uploaded from /admin/config into
 * the public Supabase Storage bucket `avatars` (created by supabase/schema.sql).
 *
 * The editor crops and re-encodes to a 512px square before sending, so real
 * uploads are ~50–150 KB; the cap here is only a backstop.
 */

const BUCKET = "avatars";
const MAX_BYTES = 1024 * 1024;

/**
 * Raster formats only. SVG is deliberately excluded: it can carry script, and
 * the file is served from a public URL.
 */
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Returns the public URL. Throws a readable message on any failure. */
export async function uploadAvatar(file: File): Promise<string> {
  const extension = EXTENSIONS[file.type];
  if (!extension) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size === 0) throw new Error("That file is empty.");
  if (file.size > MAX_BYTES) throw new Error("Image is too large (max 1 MB).");

  // A fresh name per upload: no overwrite races, and browsers/CDNs never serve
  // a stale cached photo after a change.
  const path = `${randomUUID()}.${extension}`;
  const storage = supabase().storage.from(BUCKET);

  const { error } = await storage.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(describeError(error));

  return storage.getPublicUrl(path).data.publicUrl;
}
