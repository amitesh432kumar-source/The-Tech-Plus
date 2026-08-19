import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile" };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ProfilePage() {
  const user = await requireUser();
  const displayName = user.profile.full_name ?? user.email ?? "Student";

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>

      <div className="mt-6 flex items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.email}</p>
          <p className="text-xs capitalize text-muted-foreground">{user.profile.role} account</p>
        </div>
      </div>

      <div className="mt-8">
        <ProfileForm fullName={user.profile.full_name ?? ""} />
      </div>
    </DashboardShell>
  );
}
