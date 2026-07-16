import type { Metadata } from "next";
import { linksProfile, visibleLinks } from "app/links-config";
import LinksClient from "./links-client";

export const metadata: Metadata = {
  title: "Links",
  description: linksProfile.bio,
  openGraph: {
    title: `${linksProfile.name} — Links`,
    description: linksProfile.bio,
    url: "/links",
    type: "profile",
  },
};

export default function LinksPage() {
  return (
    <section className="py-4">
      <LinksClient links={visibleLinks()} />
    </section>
  );
}
