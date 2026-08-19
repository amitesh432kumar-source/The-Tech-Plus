import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await requireRole("admin");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user.email}</span> with
        admin access.
      </p>
      <p className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        The full admin dashboard and CMS — courses, webinars, students, orders, coupons —
        is built in a later phase. This page confirms that role-based authorization is
        working end to end: only users with role &quot;admin&quot; can reach it.
      </p>
    </section>
  );
}
