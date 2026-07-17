"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import type { LinksProfile } from "app/links-config";

/**
 * The icon arrives already rendered from the server (see page.tsx). That keeps
 * the ~210-icon registry out of this bundle: visitors download the handful of
 * SVGs actually on the page instead of every icon the admin picker offers.
 */
export type RenderedLink = {
  id: string;
  label: string;
  description?: string;
  href: string;
  featured?: boolean;
  icon: ReactNode;
  /** Preset color tint for the icon chip, or undefined for the theme default. */
  iconStyle?: CSSProperties;
};

const VISITOR_FLAG = "pf_seen_links";

/**
 * `keepalive` lets the request outlive the page when a tap navigates away —
 * a plain fetch would be cancelled and the click would go uncounted.
 */
function track(payload: Record<string, unknown>): void {
  try {
    void fetch("/api/links/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break a link.
  }
}

function useVisitTracking(): void {
  const tracked = useRef(false);

  useEffect(() => {
    // React StrictMode runs effects twice in dev; this keeps the count honest.
    if (tracked.current) return;
    tracked.current = true;

    let firstVisit = false;
    try {
      firstVisit = localStorage.getItem(VISITOR_FLAG) === null;
      if (firstVisit) localStorage.setItem(VISITOR_FLAG, "1");
    } catch {
      // Private mode / storage blocked: still counts as a visit.
    }

    track({ type: "visit", firstVisit });
  }, []);
}

function LinkButton({ link }: { link: RenderedLink }) {
  const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");

  return (
    <a
      href={link.href}
      onClick={() => track({ type: "click", id: link.id })}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={[
        "group flex items-center gap-4 w-full rounded-2xl px-4 py-4 min-h-[68px]",
        "border no-underline transition-all duration-200",
        "active:scale-[0.98] touch-manipulation",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#47a3f3]",
        link.featured
          ? "border-[#47a3f3]/50 bg-[#47a3f3]/[0.07] hover:bg-[#47a3f3]/[0.14] hover:border-[#47a3f3]"
          : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/20",
      ].join(" ")}
    >
      <span
        className={[
          "flex-none grid place-items-center w-11 h-11 rounded-xl text-xl transition-transform duration-200 group-hover:scale-110",
          // A chosen color (inline style) wins; otherwise fall back to the
          // featured tint or the neutral chip.
          link.iconStyle
            ? ""
            : link.featured
              ? "bg-[#47a3f3]/15 text-[#47a3f3]"
              : "bg-black/[0.05] dark:bg-white/[0.08] text-[#1C1C1C] dark:text-[#D4D4D4]",
        ].join(" ")}
        style={link.iconStyle}
        aria-hidden="true"
      >
        {link.icon}
      </span>

      <span className="flex flex-col min-w-0 flex-1">
        <span className="font-medium text-[15px] text-black dark:text-white truncate">
          {link.label}
        </span>
        {link.description && (
          <span className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-snug">
            {link.description}
          </span>
        )}
      </span>

      <span
        className="flex-none text-neutral-400 dark:text-neutral-600 transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        →
      </span>
    </a>
  );
}

export default function LinksClient({
  links,
  profile,
}: {
  links: RenderedLink[];
  profile: LinksProfile;
}) {
  useVisitTracking();

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <header className="flex flex-col items-center text-center mb-8">
        {profile.avatar && (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={96}
            height={96}
            className="rounded-full mb-4"
            unoptimized
            priority
          />
        )}
        <h1 className="text-xl font-medium text-black dark:text-white">
          {profile.name}
        </h1>
        {profile.handle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {profile.handle}
          </p>
        )}
        {profile.bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 text-balance leading-relaxed">
            {profile.bio}
          </p>
        )}
      </header>

      <nav className="flex flex-col gap-3" aria-label="My links">
        {links.map((link) => (
          <LinkButton key={link.id} link={link} />
        ))}
      </nav>
    </div>
  );
}
