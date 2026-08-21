"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "app/lib/admin-auth";
import {
  deletePost as dbDeletePost,
  insertPost,
  slugTaken,
  updatePost,
  validateDraft,
  type PostDraft,
  type PostVisibility,
} from "app/lib/posts-store";

export type PostSaveState = { errors?: string[]; ok?: boolean };

type PostPayload = {
  slug: string;
  title: string;
  excerpt: string;
  visibility: PostVisibility;
  bodyMd: string;
};

/** Validate + slug sanity-check both share this normalization. */
function prepare(payload: PostPayload) {
  const { draft, errors } = validateDraft(payload);
  return { draft, errors };
}

/** New post from the editor. On success returns { ok, slug } for redirection. */
export async function createPost(
  payload: PostPayload,
): Promise<PostSaveState & { slug?: string }> {
  if (!(await isAdmin())) return { errors: ["Session expired. Log in again."] };

  const { draft, errors } = prepare(payload);
  if (errors.length) return { errors };
  if (await slugTaken(draft.slug)) {
    return { errors: ["That slug is already taken — pick another one."] };
  }

  try {
    const post = await insertPost(draft);
    revalidatePath("/blog");
    revalidatePath("/blog/" + post.slug);
    return { ok: true, slug: post.slug };
  } catch (error) {
    console.error("[admin/blog] failed to create post:", error);
    return { errors: ["Could not create post: " + error] };
  }
}

/** Update an existing post by id. */
export async function savePost(
  id: number,
  payload: PostPayload,
): Promise<PostSaveState> {
  if (!(await isAdmin())) return { errors: ["Session expired. Log in again."] };

  const { draft, errors } = prepare(payload);
  if (errors.length) return { errors };
  if (await slugTaken(draft.slug, id)) {
    return { errors: ["That slug is already taken — pick another one."] };
  }

  try {
    await updatePost(id, draft);
    revalidatePath("/blog");
    revalidatePath("/blog/" + draft.slug);
    revalidatePath("/admin/blog");
    return { ok: true };
  } catch (error) {
    console.error("[admin/blog] failed to save post:", error);
    return { errors: ["Could not save post: " + error] };
  }
}

/** Delete a post by id. */
export async function removePost(id: number): Promise<PostSaveState> {
  if (!(await isAdmin())) return { errors: ["Session expired. Log in again."] };

  try {
    await dbDeletePost(id);
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { ok: true };
  } catch (error) {
    console.error("[admin/blog] failed to delete post:", error);
    return { errors: ["Could not delete post: " + error] };
  }
}
