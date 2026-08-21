import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "app/lib/admin-auth";
import PostEditor from "../editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  if (!(await isAdmin())) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-black dark:text-white">New post</h1>
        <Link href="/admin/blog" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors no-underline">
          ← Back
        </Link>
      </div>
      <PostEditor
        item={{ id: null, slug: "", title: "", excerpt: "", visibility: "public", bodyMd: "" }}
      />
    </div>
  );
}
