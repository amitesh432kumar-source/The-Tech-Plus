import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listMyOrders } from "@/services/orders";

export const metadata: Metadata = { title: "My Orders" };

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

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listMyOrders(user.id);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your purchase history.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <Receipt className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {o.items.map((item, i) => (
                    <p key={i} className="text-sm font-medium">
                      {item.title}
                    </p>
                  ))}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
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
        </div>
      )}
    </DashboardShell>
  );
}
