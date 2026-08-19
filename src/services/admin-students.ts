import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminStudentListItem {
  id: string;
  fullName: string;
  email: string | null;
  role: string;
  createdAt: string;
  enrollmentCount: number;
}

export async function listAdminStudents(search?: string): Promise<AdminStudentListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, role, created_at, course_enrollments(id)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data } = await query;
  if (!data) return [];

  // Emails live in auth.users, not profiles — only the service-role client
  // can read across schemas like this.
  const admin = createAdminClient();
  const ids = data.map((p) => p.id);
  const emailById = new Map<string, string>();

  if (ids.length > 0) {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authUsers?.users ?? []) {
      if (ids.includes(u.id)) emailById.set(u.id, u.email ?? "");
    }
  }

  return data.map((p) => ({
    id: p.id,
    fullName: p.full_name ?? "Unnamed",
    email: emailById.get(p.id) ?? null,
    role: p.role,
    createdAt: p.created_at,
    enrollmentCount: Array.isArray(p.course_enrollments) ? p.course_enrollments.length : 0,
  }));
}
