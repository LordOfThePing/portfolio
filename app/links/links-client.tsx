"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  /**
   * If present and non-empty, the button becomes an accordion disclosure. The
   * children render as a nested list beneath it, each tracked as a click on
   * the composite id (`<parent>:<child>`).
   */
  children?: RenderedLink[];
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

/**
 * Each list dedupes visitors on its own, so a device counts as a new visitor
 * on every list it opens — the per-list numbers stay right, the "all lists"
 * total can count a device more than once.
 */
const visitorFlag = (list?: string) => (list ? `${VISITOR_FLAG}:${list}` : VISITOR_FLAG);

function useVisitTracking(enabled: boolean, list?: string): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    // React StrictMode runs effects twice in dev; this keeps the count honest.
    if (tracked.current) return;
    tracked.current = true;

    let firstVisit = false;
    try {
      firstVisit = localStorage.getItem(visitorFlag(list)) === null;
      if (firstVisit) localStorage.setItem(visitorFlag(list), "1");
    } catch {
      // Private mode / storage blocked: still counts as a visit.
    }

    track({ type: "visit", firstVisit, list });
  }, [enabled, list]);
}

/** The icon chip. iconStyle (color-based) wins; else fall back to featured/neutral. */
function LinkChrome({
  link,
  trailing,
}: {
  link: RenderedLink;
  trailing: ReactNode;
}) {
  return (
    <>
      <span
        className={[
          "flex-none grid place-items-center w-11 h-11 rounded-xl text-xl transition-transform duration-200 group-hover:scale-110",
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
        className="flex-none text-neutral-400 dark:text-neutral-600 transition-transform duration-200"
        aria-hidden="true"
      >
        {trailing}
      </span>
    </>
  );
}

/**
 * Base frame classes + inline `--feat-fg` when a featured link also has a
 * picked color — the pf-featured-colored class in global.css reads that
 * variable so hover/focus stay color-aware without extra JS.
 */
function frameProps(link: RenderedLink): {
  className: string;
  style?: CSSProperties;
} {
  const base =
    "group flex items-center gap-4 w-full rounded-2xl px-4 py-4 min-h-[68px] border no-underline transition-all duration-200 active:scale-[0.98] touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  if (!link.featured) {
    return {
      className: `${base} focus-visible:outline-[#47a3f3] border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/20`,
    };
  }

  const fg = typeof link.iconStyle?.color === "string" ? link.iconStyle.color : undefined;
  if (fg) {
    return {
      className: `${base} pf-featured-colored`,
      style: { ["--feat-fg" as string]: fg } as CSSProperties,
    };
  }

  return {
    className: `${base} focus-visible:outline-[#47a3f3] border-[#47a3f3]/50 bg-[#47a3f3]/[0.07] hover:bg-[#47a3f3]/[0.14] hover:border-[#47a3f3]`,
  };
}

function LeafButton({ link, list }: { link: RenderedLink; list?: string }) {
  const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");
  const frame = frameProps(link);

  return (
    <a
      href={link.href}
      onClick={() => track({ type: "click", id: link.id, list })}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={frame.className}
      style={frame.style}
    >
      <LinkChrome
        link={link}
        trailing={<span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">→</span>}
      />
    </a>
  );
}

function GroupButton({ link, list }: { link: RenderedLink; list?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `links-group-${link.id.replace(/[^a-z0-9_-]/gi, "-")}`;
  const frame = frameProps(link);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Count the group tap once per expand so the group behaves like any other
    // button in stats, matching the direct /links/<id> share link.
    if (next) track({ type: "click", id: link.id, list });
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`${frame.className} text-left`}
        style={frame.style}
      >
        <LinkChrome
          link={link}
          trailing={
            <span
              className={[
                "inline-block transition-transform duration-200",
                open ? "rotate-180" : "",
              ].join(" ")}
            >
              ▾
            </span>
          }
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="flex flex-col gap-2 mt-2 ml-4 pl-3 border-l border-black/10 dark:border-white/10"
        >
          {link.children?.map((child) => (
            <LeafButton key={child.id} link={child} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}

function LinkButton({ link, list }: { link: RenderedLink; list?: string }) {
  if (link.children?.length) return <GroupButton link={link} list={list} />;
  return <LeafButton link={link} list={list} />;
}

export default function LinksClient({
  links,
  profile,
  trackVisit = true,
  list,
}: {
  links: RenderedLink[];
  profile: LinksProfile;
  /** The chooser page (/links/<group>) suppresses this to avoid double-count. */
  trackVisit?: boolean;
  /** Custom list id; tags this page's visits and clicks in stats. */
  list?: string;
}) {
  useVisitTracking(trackVisit, list);

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
          <LinkButton key={link.id} link={link} list={list} />
        ))}
      </nav>
    </div>
  );
}
