"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "./actions";

const TABS = [
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/config", label: "Config" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <nav className="flex gap-1 rounded-xl border border-black/10 dark:border-white/10 p-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={[
                "rounded-lg px-3 py-1.5 text-sm no-underline transition-colors",
                active
                  ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="text-sm rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
