"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./nav";

/**
 * The Navbar (portfolio title + theme toggle) renders on every page from the
 * root layout. /links is a standalone bio-link page, so it hides the Navbar —
 * theme still follows the visitor's device via the ThemeProvider in the layout.
 */
export function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname === "/links") return null;
  return <Navbar />;
}
