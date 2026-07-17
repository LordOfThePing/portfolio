import type { Metadata } from "next";
import { isAdmin, missingEnvVars } from "app/lib/admin-auth";
import LoginForm from "./login-form";
import AdminNav from "./admin-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * One gate for every admin page. Each page re-checks the session before reading
 * data, and so does every server action — this layout controls what renders,
 * not what's authorized.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    return <LoginForm missing={missingEnvVars()} />;
  }

  return (
    <section className="py-4 w-full">
      <AdminNav />
      {children}
    </section>
  );
}
