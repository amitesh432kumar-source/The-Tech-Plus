"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { updateProfileAction, type ProfileState } from "@/features/profile/actions";

const initialState: ProfileState = {};

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="flex items-center gap-1.5 text-sm text-[var(--brand-blue)]">
          <CheckCircle2 className="size-4" /> Saved
        </p>
      )}
      <SubmitButton className="w-auto">Save changes</SubmitButton>
    </form>
  );
}
