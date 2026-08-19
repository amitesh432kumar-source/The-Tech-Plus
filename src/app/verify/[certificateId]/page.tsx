import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Verify a The Tech Plus course completion certificate.",
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const supabase = await createClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_code", certificateId)
    .single();

  return (
    <>
      <PageHeader eyebrow="Certificate Verification" title="Verify a Certificate" />
      <section className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        {certificate ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-12 text-[var(--brand-blue)]" />
            <p className="mt-4 text-lg font-semibold">Certificate Verified</p>
            <dl className="mt-6 space-y-3 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Student</dt>
                <dd className="font-medium">{certificate.student_name_snapshot}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="font-medium">{certificate.course_title_snapshot}</dd>
              </div>
              {certificate.instructor_name_snapshot && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Instructor</dt>
                  <dd className="font-medium">{certificate.instructor_name_snapshot}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Issued</dt>
                <dd className="font-medium">
                  {new Date(certificate.issued_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Certificate ID</dt>
                <dd className="font-mono text-xs">{certificate.certificate_code}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <XCircle className="mx-auto size-12 text-destructive" />
            <p className="mt-4 text-lg font-semibold">Certificate Not Found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              No certificate matches the ID &quot;{certificateId}&quot;. Double-check the
              link or certificate code.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
