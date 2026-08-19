import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome, {user.profile.full_name ?? user.email}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user.email}</span> ·
        role: <span className="font-medium text-foreground">{user.profile.role}</span>
      </p>
      <p className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        The full student dashboard — enrolled courses, progress, webinars, orders, and
        certificates — is built in a later phase. This page confirms that authentication
        and route protection are working end to end.
      </p>
      <form action={logoutAction} className="mt-6">
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </section>
  );
}
