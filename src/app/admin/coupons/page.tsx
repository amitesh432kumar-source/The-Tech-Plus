import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponToggle } from "@/components/admin/coupon-toggle";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { deleteCouponAction } from "@/features/admin/coupons";

export const metadata: Metadata = { title: "Admin · Coupons" };

export default async function AdminCouponsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>

      <div className="mt-6">
        <CouponForm />
      </div>

      <div className="mt-6 space-y-2">
        {(coupons ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-mono font-semibold">{c.code}</p>
              <p className="text-xs text-muted-foreground">
                {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`} · used{" "}
                {c.times_used}
                {c.usage_limit ? `/${c.usage_limit}` : ""}
                {c.valid_until && ` · expires ${new Date(c.valid_until).toLocaleDateString("en-IN")}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CouponToggle couponId={c.id} active={c.active} />
              <DeleteButton action={deleteCouponAction.bind(null, c.id)} confirmLabel={`Delete coupon "${c.code}"?`} />
            </div>
          </div>
        ))}
        {(coupons ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No coupons yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
