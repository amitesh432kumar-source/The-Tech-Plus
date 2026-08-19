import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { WebinarForm } from "@/components/admin/webinar-form";
import { requireRole } from "@/lib/auth/session";
import { createWebinarAction } from "@/features/admin/webinars";

export const metadata: Metadata = { title: "New Webinar" };

export default async function NewWebinarPage() {
  await requireRole("admin");

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">New Webinar</h1>
      <div className="mt-6 max-w-2xl">
        <WebinarForm action={createWebinarAction} />
      </div>
    </AdminShell>
  );
}
