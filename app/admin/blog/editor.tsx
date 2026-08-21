"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify, type PostDraft, type PostVisibility } from "app/lib/posts-shared";
import { createPost, savePost } from "./actions";

const field =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-2 text-[16px] sm:text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#47a3f3]";
const labelText =
  "text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400";

type FormState = { errors?: string[]; ok?: boolean };
type EditorItem = PostDraft & { id: number | null };

export default function PostEditor({ item, onDone }: { item: EditorItem; onDone?: () => void }) {
  const router = useRouter();
  const fieldId = useId();
  const isNew = item.id === null;
  const [title, setTitle] = useState(item.title);
  const [slug, setSlug] = useState(item.slug);
  const [excerpt, setExcerpt] = useState(item.excerpt);
  const [visibility, setVisibility] = useState<PostVisibility>(item.visibility);
  const [bodyMd, setBodyMd] = useState(item.bodyMd);
  const [slugAuto, setSlugAuto] = useState(item.slug === "");
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  const handleCancel = () => {
    if (onDone) onDone();
    else router.push("/admin/blog");
  };

  const onTitle = (value: string) => {
    setTitle(value);
    if (slugAuto) setSlug(slugify(value));
  };

  const submit = () => {
    const payload = { title, slug, excerpt, visibility, bodyMd };
    startTransition(async () => {
      const result: { ok?: boolean; errors?: string[]; slug?: string } = isNew
        ? await createPost(payload)
        : await savePost(item.id!, payload);
      if (result.ok) {
        if (isNew && result.slug) router.push("/admin/blog");
        setState({ ok: true });
        onDone?.();
      } else {
        setState({ errors: result.errors });
      }
    });
  };

  const saved = Boolean(state.ok) && !pending;

  return (
    <div className="flex flex-col gap-6">
      {state.errors?.length ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-red-500/40 bg-red-500/[0.06] p-4">
          {state.errors.map((error) => (
            <li key={error} className="text-sm text-red-600 dark:text-red-400">{error}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className={labelText} htmlFor={fieldId + "-title"}>Title</label>
        <input id={fieldId + "-title"} className={field} value={title} placeholder="My first post" onChange={(e) => onTitle(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelText} htmlFor={fieldId + "-slug"}>Slug (URL path)</label>
        <input id={fieldId + "-slug"} className={field + " font-mono text-[13px]"} value={slug} placeholder="my-first-post" autoCapitalize="none" autoCorrect="off" onChange={(e) => { setSlug(e.target.value); setSlugAuto(false); }} />
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Public URL: /blog/ + slug. Keep auto-generated or type your own.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelText} htmlFor={fieldId + "-excerpt"}>Excerpt (shown on /blog list, optional)</label>
        <input id={fieldId + "-excerpt"} className={field} value={excerpt} placeholder="A one-line summary" onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelText}>Visibility</span>
        <div className="flex flex-wrap gap-2">
          {(["public", "private"] as const).map((v) => {
            const active = visibility === v;
            return (
              <button key={v} type="button" onClick={() => setVisibility(v)} aria-pressed={active} className={[
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                active ? "bg-black dark:bg-white text-white dark:text-black font-medium" : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
              ].join(" ")}>
                {v === "public" ? "🌐 Public" : "🔒 Private (shared link)"}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Public posts are listed on /blog and open to everyone. Private posts are never 
          listed — publish them, then share the secret /blog/p/ link from the editor.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelText} htmlFor={fieldId + "-body"}>Markdown body</label>
        <textarea id={fieldId + "-body"} rows={16} className={field + " font-mono text-[13px] leading-relaxed resize-y"} value={bodyMd} placeholder={"# Heading\n\nWrite in **Markdown**..."} onChange={(e) => setBodyMd(e.target.value)} />
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Supports GitHub-flavored Markdown: lists, tables, code blocks, blockquotes, strikethrough.
        </p>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 py-4 bg-white dark:bg-[#121212] border-t border-black/10 dark:border-white/10">
        <button type="button" onClick={submit} disabled={pending} className="rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium px-5 py-3 min-h-[48px] transition-opacity hover:opacity-85 active:scale-[0.98] disabled:opacity-40">
          {pending ? "Saving…" : isNew ? "Create post" : saved ? "Saved ✓" : "Save changes"}
        </button>
        <button type="button" onClick={handleCancel} className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
