import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { EventForm } from "@/components/admin/event-form";
import { requireRole } from "@/lib/auth/session";
import { createEventAction } from "@/features/admin/events";

export const metadata: Metadata = { title: "New Workshop" };

export default async function NewEventPage() {
  await requireRole("admin");

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">New Workshop / Event</h1>
      <div className="mt-6 max-w-2xl">
        <EventForm action={createEventAction} />
      </div>
    </AdminShell>
  );
}
