"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  FaSuitcase,
  FaXTwitter,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaGlobe,
  FaChartLine,
  FaRocket,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import type { IconType } from "react-icons";
import { linksProfile, type LinkIcon, type LinkItem } from "app/links-config";

const ICONS: Record<LinkIcon, IconType> = {
  cv: FaSuitcase,
  email: TbMailFilled,
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  whatsapp: FaWhatsapp,
  globe: FaGlobe,
  chart: FaChartLine,
  rocket: FaRocket,
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

function LinkButton({ link }: { link: LinkItem }) {
  const Icon = ICONS[link.icon];
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
          link.featured
            ? "bg-[#47a3f3]/15 text-[#47a3f3]"
            : "bg-black/[0.05] dark:bg-white/[0.08] text-[#1C1C1C] dark:text-[#D4D4D4]",
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon />
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

export default function LinksClient({ links }: { links: LinkItem[] }) {
  useVisitTracking();

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <header className="flex flex-col items-center text-center mb-8">
        <Image
          src={linksProfile.avatar}
          alt={linksProfile.name}
          width={96}
          height={96}
          className="rounded-full mb-4"
          unoptimized
          priority
        />
        <h1 className="text-xl font-medium text-black dark:text-white">
          {linksProfile.name}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {linksProfile.handle}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 text-balance leading-relaxed">
          {linksProfile.bio}
        </p>
      </header>

      <nav className="flex flex-col gap-3" aria-label="My links">
        {links.map((link) => (
          <LinkButton key={link.id} link={link} />
        ))}
      </nav>
    </div>
  );
}
