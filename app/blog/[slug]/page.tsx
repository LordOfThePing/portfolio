import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPostBySlug } from "app/lib/posts-store";
import { formatDate } from "app/lib/date";
import Markdown from "app/components/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: { title: post.title, description: post.excerpt || undefined },
    twitter: { card: "summary_large_image", title: post.title },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="flex flex-col gap-4 w-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-black dark:text-white title">
          {post.title}
        </h1>
        {post.publishedAt && (
          <time
            dateTime={post.publishedAt}
            className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
          >
            {formatDate(post.publishedAt)}
          </time>
        )}
      </header>
      <Markdown source={post.bodyMd} />
    </article>
  );
}
