import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "app/lib/admin-auth";
import { getPostById } from "app/lib/posts-store";
import CopyLink from "app/components/copy-link";
import PostEditor from "../editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  if (!(await isAdmin())) return null;
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();
  const post = await getPostById(postId);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-black dark:text-white">Edit post</h1>
        <Link href="/admin/blog" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors no-underline">
          ← Back
        </Link>
      </div>

      {post.visibility === "private" ? (
        <p className="text-xs rounded-xl border border-black/10 dark:border-white/10 p-4 bg-black/[0.02] dark:bg-white/[0.03] text-neutral-600 dark:text-neutral-300 leading-relaxed">
          This post is private — it is not listed on /blog. To share it, copy the 
          private link below and send it to the person you want to read it (e.g. a 
          job proposal). Anyone with that link can read it, so treat it like a secret.
        </p>
      ) : null}

      {post.visibility === "private" ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Private share link
          </span>
          <CopyLink path={"/blog/p/" + post.token} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Public link
          </span>
          <CopyLink path={"/blog/" + post.slug} />
        </div>
      )}

      <PostEditor
        key={post.id}
        item={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          visibility: post.visibility,
          bodyMd: post.bodyMd,
        }}
        onDone={() => {}}
      />
    </div>
  );
}
