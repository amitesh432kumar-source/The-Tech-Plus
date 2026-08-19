import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminOrderListItem {
  id: string;
  studentName: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: string[];
}

export async function listAdminOrders(): Promise<AdminOrderListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("id, status, total, currency, created_at, profiles(full_name), order_items(title_snapshot)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((o) => ({
    id: o.id,
    studentName: (o.profiles as { full_name: string | null } | null)?.full_name ?? "Student",
    status: o.status,
    total: o.total,
    currency: o.currency,
    createdAt: o.created_at,
    items: (o.order_items as { title_snapshot: string }[]).map((i) => i.title_snapshot),
  }));
}
