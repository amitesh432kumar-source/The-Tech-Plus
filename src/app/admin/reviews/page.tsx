import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewModerationButtons } from "@/components/admin/review-moderation-buttons";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Reviews" };

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  approved: "default",
  pending: "outline",
  rejected: "destructive",
};

export default async function AdminReviewsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, review_text, status, created_at, profiles(full_name), courses(title)")
    .order("created_at", { ascending: false });

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">Moderate student reviews before they go public.</p>

      <div className="mt-6 space-y-3">
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {(r.profiles as { full_name: string | null } | null)?.full_name ?? "Student"} ·{" "}
                  {(r.courses as { title: string } | null)?.title}
                </p>
                <p className="text-xs text-muted-foreground">{r.rating} / 5 stars</p>
                {r.review_text && <p className="mt-2 text-sm">{r.review_text}</p>}
              </div>
              <Badge variant={statusVariant[r.status] ?? "outline"} className="capitalize">
                {r.status}
              </Badge>
            </div>
            {r.status === "pending" && (
              <div className="mt-3">
                <ReviewModerationButtons reviewId={r.id} />
              </div>
            )}
          </div>
        ))}
        {(reviews ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No reviews yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
