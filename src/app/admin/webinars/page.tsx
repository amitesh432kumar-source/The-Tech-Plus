import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireRole } from "@/lib/auth/session";
import { listAdminWebinars } from "@/services/admin-webinars";
import { deleteWebinarAction } from "@/features/admin/webinars";

export const metadata: Metadata = { title: "Admin · Webinars" };

export default async function AdminWebinarsPage() {
  await requireRole("admin");
  const webinars = await listAdminWebinars();

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webinars</h1>
          <p className="mt-1 text-sm text-muted-foreground">{webinars.length} total</p>
        </div>
        <Button render={<Link href="/admin/webinars/new" />}>
          <Plus className="size-4" /> New Webinar
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {webinars.map((w) => (
          <div
            key={w.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{w.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(w.scheduledDate).toLocaleDateString("en-IN")} · ₹{w.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {w.status}
              </Badge>
              <Button variant="outline" size="sm" render={<Link href={`/admin/webinars/${w.id}/edit`} />}>
                Edit
              </Button>
              <DeleteButton action={deleteWebinarAction.bind(null, w.id)} confirmLabel={`Delete "${w.title}"?`} />
            </div>
          </div>
        ))}
        {webinars.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No webinars yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
