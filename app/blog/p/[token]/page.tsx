import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostByToken } from "app/lib/posts-store";
import { formatDate } from "app/lib/date";
import Markdown from "app/components/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function PrivatePostPage({ params }: Props) {
  const { token } = await params;
  const post = await getPostByToken(token);
  if (!post) notFound();

  // A private post is shared by this unguessable link. If by some coincidence
  // a public post's token is hit, gate it too — this page only ever serves
  // content to someone holding the token either way.
  const isPrivate = post.visibility === "private";

  return (
    <article className="flex flex-col gap-4 w-full">
      {isPrivate && (
        <div className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Private · shared link
        </div>
      )}
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
