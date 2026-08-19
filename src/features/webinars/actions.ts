"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyUser } from "@/services/notifications";

export interface RegisterState {
  error?: string;
  success?: boolean;
}

/**
 * Self-registration for free webinars only — RLS allows any authenticated
 * user to insert their own registration row. Paid webinars require the
 * Razorpay checkout flow (Phase 7) before a registration is recorded.
 */
// The trailing (prevState, formData) args come from useActionState once
// webinarId/webinarSlug are bound; neither is read, since the target
// webinar comes from the bound arguments rather than form fields.
export async function registerForWebinarAction(
  webinarId: string,
  webinarSlug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: RegisterState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<RegisterState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/webinars/${webinarSlug}`);
  }

  const { data: webinar } = await supabase
    .from("webinars")
    .select("title, price, max_seats")
    .eq("id", webinarId)
    .single();

  if (!webinar) return { error: "Webinar not found." };
  if (webinar.price > 0) {
    return { error: "This webinar requires payment — registration opens soon." };
  }

  const { count } = await supabase
    .from("webinar_registrations")
    .select("id", { count: "exact", head: true })
    .eq("webinar_id", webinarId);

  if ((count ?? 0) >= webinar.max_seats) {
    return { error: "This webinar is fully booked." };
  }

  const { error } = await supabase
    .from("webinar_registrations")
    .insert({ webinar_id: webinarId, student_id: user.id });

  if (error) {
    if (error.code === "23505") return { success: true }; // already registered
    return { error: "Something went wrong. Please try again." };
  }

  await notifyUser(user.id, {
    type: "webinar_registered",
    title: "Webinar registration confirmed",
    body: `You're registered for "${webinar.title}".`,
  });

  revalidatePath(`/webinars/${webinarSlug}`);
  return { success: true };
}
