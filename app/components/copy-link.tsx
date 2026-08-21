"use client";

import { useState } from "react";

/** A path-only share link with a copy button. Path keeps it host-agnostic. */
export default function CopyLink({ path, label }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + path : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (no HTTPS / permissions) — path is still visible.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 truncate rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-neutral-600 dark:text-neutral-300">
        {path}
      </code>
      <button
        type="button"
        onClick={copy}
        className="flex-none text-[12px] rounded-lg border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
      >
        {copied ? "Copied ✓" : label ?? "Copy"}
      </button>
    </div>
  );
}
