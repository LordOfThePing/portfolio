import type { Metadata } from "next";
import { isAdmin } from "app/lib/admin-auth";
import { readConfig } from "app/lib/links-store";
import ConfigEditor from "./config-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Config",
  robots: { index: false, follow: false },
};

export default async function ConfigPage() {
  // The layout already gates rendering; this guards the data read itself.
  if (!(await isAdmin())) return null;

  const config = await readConfig();
  return <ConfigEditor initialConfig={config} />;
}
