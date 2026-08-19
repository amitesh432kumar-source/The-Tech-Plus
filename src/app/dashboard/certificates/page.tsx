import type { Metadata } from "next";
import Link from "next/link";
import { Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listMyCertificates } from "@/services/certificates";

export const metadata: Metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await listMyCertificates(user.id);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Issued automatically when you complete every lesson in a course.
      </p>

      {certificates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <Award className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Complete a course to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <Link
              key={c.id}
              href={`/verify/${c.certificateCode}`}
              className="card-hover rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                <Award className="size-5" />
              </div>
              <p className="font-semibold">{c.courseTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Issued {new Date(c.issuedAt).toLocaleDateString("en-IN")}
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{c.certificateCode}</p>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
