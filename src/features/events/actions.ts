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
 * Self-registration for free workshops/events only — mirrors
 * features/webinars/actions.ts. Paid events require the Razorpay checkout
 * flow (Phase 7) before a registration is recorded.
 */
// The trailing (prevState, formData) args come from useActionState once
// eventId/eventSlug are bound; neither is read, since the target event
// comes from the bound arguments rather than form fields.
export async function registerForEventAction(
  eventId: string,
  eventSlug: string,
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
    redirect(`/login?next=/workshops/${eventSlug}`);
  }

  const { data: event } = await supabase
    .from("events")
    .select("title, price, max_seats")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found." };
  if (event.price > 0) {
    return { error: "This event requires payment — registration opens soon." };
  }

  const { count } = await supabase
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if ((count ?? 0) >= event.max_seats) {
    return { error: "This event is fully booked." };
  }

  const { error } = await supabase
    .from("event_registrations")
    .insert({ event_id: eventId, student_id: user.id });

  if (error) {
    if (error.code === "23505") return { success: true };
    return { error: "Something went wrong. Please try again." };
  }

  await notifyUser(user.id, {
    type: "event_registered",
    title: "Registration confirmed",
    body: `You're registered for "${event.title}".`,
  });

  revalidatePath(`/workshops/${eventSlug}`);
  return { success: true };
}
