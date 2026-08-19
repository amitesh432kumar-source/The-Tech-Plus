import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/session";
import { listAdminStudents } from "@/services/admin-students";

export const metadata: Metadata = { title: "Admin · Students" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("admin");
  const { q } = await searchParams;
  const students = await listAdminStudents(q);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Students</h1>
      <p className="mt-1 text-sm text-muted-foreground">{students.length} shown (max 100)</p>

      <form className="mt-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="h-8 w-full max-w-xs rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Enrollments</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{s.fullName}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{s.email ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="outline" className="capitalize">
                    {s.role}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">{s.enrollmentCount}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No students found.</p>
        )}
      </div>
    </AdminShell>
  );
}
