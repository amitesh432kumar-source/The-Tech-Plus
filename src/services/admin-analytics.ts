import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminAnalytics {
  totalStudents: number;
  totalCourses: number;
  totalWebinars: number;
  totalEnrollments: number;
  totalWebinarRegistrations: number;
  totalSales: number;
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    studentName: string;
  }[];
}

/** All counts here are real, live counts from the database — no fabricated stats. */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: totalCourses },
    { count: totalWebinars },
    { count: totalEnrollments },
    { count: totalWebinarRegistrations },
    { data: paidOrders },
    { data: recentOrdersRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("webinars").select("id", { count: "exact", head: true }),
    supabase.from("course_enrollments").select("id", { count: "exact", head: true }),
    supabase.from("webinar_registrations").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("status", "paid"),
    supabase
      .from("orders")
      .select("id, total, status, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalSales = (paidOrders ?? []).reduce((sum, o) => sum + o.total, 0);

  const recentOrders = (recentOrdersRaw ?? []).map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
    studentName: (o.profiles as { full_name: string | null } | null)?.full_name ?? "Student",
  }));

  return {
    totalStudents: totalStudents ?? 0,
    totalCourses: totalCourses ?? 0,
    totalWebinars: totalWebinars ?? 0,
    totalEnrollments: totalEnrollments ?? 0,
    totalWebinarRegistrations: totalWebinarRegistrations ?? 0,
    totalSales,
    recentOrders,
  };
}
