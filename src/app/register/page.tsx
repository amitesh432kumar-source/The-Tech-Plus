import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free The Tech Plus account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join The Tech Plus to start learning."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleButton />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
