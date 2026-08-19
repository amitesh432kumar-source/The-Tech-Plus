import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/session";
import { listAdminOrders } from "@/services/admin-orders";

export const metadata: Metadata = { title: "Admin · Orders" };

const statusVariant: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  paid: "default",
  pending: "outline",
  processing: "outline",
  failed: "destructive",
  refunded: "secondary",
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrdersPage() {
  await requireRole("admin");
  const orders = await listAdminOrders();

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} shown (max 200)</p>

      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.studentName}</p>
                <p className="text-xs text-muted-foreground">{o.items.join(", ")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
                <Badge variant={statusVariant[o.status] ?? "outline"} className="mt-1 capitalize">
                  {o.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
