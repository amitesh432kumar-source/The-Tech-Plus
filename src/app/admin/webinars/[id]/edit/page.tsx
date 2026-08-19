import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { WebinarForm } from "@/components/admin/webinar-form";
import { requireRole } from "@/lib/auth/session";
import { getAdminWebinarForEdit } from "@/services/admin-webinars";
import { updateWebinarAction } from "@/features/admin/webinars";

export const metadata: Metadata = { title: "Edit Webinar" };

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const webinar = await getAdminWebinarForEdit(id);
  if (!webinar) notFound();

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Edit Webinar</h1>
      <div className="mt-6 max-w-2xl">
        <WebinarForm action={updateWebinarAction.bind(null, id)} defaultValues={webinar} />
      </div>
    </AdminShell>
  );
}
