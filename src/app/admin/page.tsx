import type { Metadata } from "next";
import { BookOpen, IndianRupee, Radio, Ticket, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/session";
import { getAdminAnalytics } from "@/services/admin-analytics";

export const metadata: Metadata = { title: "Admin Overview" };

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusVariant: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  paid: "default",
  pending: "outline",
  processing: "outline",
  failed: "destructive",
  refunded: "secondary",
};

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const stats = await getAdminAnalytics();

  const cards = [
    { icon: Users, label: "Total Students", value: stats.totalStudents },
    { icon: BookOpen, label: "Total Courses", value: stats.totalCourses },
    { icon: Radio, label: "Total Webinars", value: stats.totalWebinars },
    { icon: UserCheck, label: "Course Enrollments", value: stats.totalEnrollments },
    { icon: Ticket, label: "Webinar Registrations", value: stats.totalWebinarRegistrations },
    { icon: IndianRupee, label: "Total Sales", value: formatPrice(stats.totalSales) },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Live figures from the database.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <c.icon className="size-5 text-[var(--brand-blue)]" />
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">{o.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(o.total)}</p>
                  <Badge variant={statusVariant[o.status] ?? "outline"} className="mt-1 capitalize">
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
