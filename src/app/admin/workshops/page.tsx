import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireRole } from "@/lib/auth/session";
import { listAdminEvents } from "@/services/admin-events";
import { deleteEventAction } from "@/features/admin/events";

export const metadata: Metadata = { title: "Admin · Workshops" };

export default async function AdminWorkshopsPage() {
  await requireRole("admin");
  const events = await listAdminEvents();

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workshops &amp; Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">{events.length} total</p>
        </div>
        <Button render={<Link href="/admin/workshops/new" />}>
          <Plus className="size-4" /> New Event
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {e.type} · {new Date(e.scheduledDate).toLocaleDateString("en-IN")} · ₹{e.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {e.status}
              </Badge>
              <Button variant="outline" size="sm" render={<Link href={`/admin/workshops/${e.id}/edit`} />}>
                Edit
              </Button>
              <DeleteButton action={deleteEventAction.bind(null, e.id)} confirmLabel={`Delete "${e.title}"?`} />
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No workshops yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
