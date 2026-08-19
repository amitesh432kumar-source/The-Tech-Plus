import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { EventForm } from "@/components/admin/event-form";
import { requireRole } from "@/lib/auth/session";
import { getAdminEventForEdit } from "@/services/admin-events";
import { updateEventAction } from "@/features/admin/events";

export const metadata: Metadata = { title: "Edit Workshop" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const event = await getAdminEventForEdit(id);
  if (!event) notFound();

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Edit Workshop / Event</h1>
      <div className="mt-6 max-w-2xl">
        <EventForm action={updateEventAction.bind(null, id)} defaultValues={event} />
      </div>
    </AdminShell>
  );
}
