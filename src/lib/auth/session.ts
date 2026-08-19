import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile;
}

/** Returns the signed-in user + profile, or null if not authenticated. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, profile };
}

/** Redirects to /login if not authenticated. Use in server components/pages. */
export async function requireUser(redirectTo = "/login"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Redirects unauthenticated users to /login and non-matching roles to /dashboard. */
export async function requireRole(role: Profile["role"]): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.profile.role !== role) redirect("/dashboard");
  return user;
}
