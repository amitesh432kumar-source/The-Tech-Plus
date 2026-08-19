import { createClient } from "@/lib/supabase/server";

export interface MyOrder {
  id: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: { title: string; itemType: string; price: number }[];
}

export async function listMyOrders(userId: string): Promise<MyOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, currency, created_at, order_items(title_snapshot, item_type, price_snapshot)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    currency: o.currency,
    createdAt: o.created_at,
    items: (o.order_items as { title_snapshot: string; item_type: string; price_snapshot: number }[]).map(
      (i) => ({ title: i.title_snapshot, itemType: i.item_type, price: i.price_snapshot }),
    ),
  }));
}
