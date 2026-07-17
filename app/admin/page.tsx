import { redirect } from "next/navigation";

/** /admin is just an entry point — send it to the stats tab. */
export default function AdminPage() {
  redirect("/admin/stats");
}
