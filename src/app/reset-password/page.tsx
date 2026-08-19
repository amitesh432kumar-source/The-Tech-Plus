import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your The Tech Plus account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="This link is only valid for a short time after being requested."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
