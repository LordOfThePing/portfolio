import type { Metadata } from "next";
import Link from "next/link";
import { listPublicPosts } from "app/lib/posts-store";
import { formatDate } from "app/lib/date";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about software, engineering and the things I build.",
};

export default async function BlogIndexPage() {
  const posts = await listPublicPosts();

  return (
    <div className="flex flex-col gap-4 w-full">
      <header>
        <h1 className="text-2xl font-medium text-black dark:text-white">Blog</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Writing about software, engineering and the things I build.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 rounded-xl border border-black/10 dark:border-white/10 p-4">
          No posts yet. Check back soon.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
          {posts.map((post) => (
            <li key={post.id} className="py-5">
              <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-1 no-underline">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {post.publishedAt ? formatDate(post.publishedAt) : ""}
                </div>
                <h2 className="text-base font-medium text-black dark:text-white group-hover:text-[#47a3f3] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
