import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "app/lib/admin-auth";
import { listAllPosts } from "app/lib/posts-store";
import { formatDate } from "app/lib/date";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  // The layout already gates rendering; this guards the data read itself.
  if (!(await isAdmin())) return null;

  const posts = await listAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-black dark:text-white">Blog</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Write and manage Markdown posts.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium px-4 py-2 text-sm transition-opacity hover:opacity-85"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 rounded-xl border border-black/10 dark:border-white/10 p-4">
          No posts yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5 rounded-xl border border-black/10 dark:border-white/10">
          {posts.map((post) => (
            <li key={post.id} className="px-4 py-3 flex items-center gap-3">
              <Link href={"/admin/blog/" + post.id} className="flex-1 min-w-0 flex flex-col no-underline">
                <span className="text-sm text-black dark:text-white truncate">
                  {post.title || "(untitled)"}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {post.visibility === "private" ? "🔒 Private" : "🌐 Public"}
                  {post.publishedAt ? " · " + formatDate(post.publishedAt) : " · Draft"}
                  {post.publishedAt ? "" : ""}
                </span>
              </Link>
              <a
                href={post.visibility === "private" ? "/blog/p/" + post.token : "/blog/" + post.slug}
                target="_blank"
                rel="noreferrer"
                className="flex-none text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline underline-offset-2 no-underline transition-colors"
              >
                {post.visibility === "private" ? "Share link" : "View"}
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Public posts appear at /blog/ + slug. Private posts are shared via an 
        unguessable /blog/p/ link — great for a single job proposal or draft.
      </p>
    </div>
  );
}
