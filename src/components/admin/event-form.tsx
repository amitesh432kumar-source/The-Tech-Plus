"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import type { AdminFormState } from "@/features/admin/courses";

const selectClass =
  "h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function EventForm({
  action,
  defaultValues,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaultValues?: {
    title?: string;
    slug?: string;
    type?: string;
    description?: string;
    scheduledDate?: string;
    durationHours?: number;
    price?: number;
    maxSeats?: number;
    status?: string;
    meetingUrl?: string;
    recordingUrl?: string;
  };
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (auto from title if blank)</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" defaultValue={defaultValues?.type ?? "workshop"} className={selectClass}>
            <option value="workshop">Workshop</option>
            <option value="bootcamp">Bootcamp</option>
            <option value="live-class">Live Class</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduledDate">Date</Label>
          <Input id="scheduledDate" name="scheduledDate" type="date" defaultValue={defaultValues?.scheduledDate} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationHours">Duration (hrs)</Label>
          <Input id="durationHours" name="durationHours" type="number" min={0} step="0.5" defaultValue={defaultValues?.durationHours ?? 1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxSeats">Max seats</Label>
          <Input id="maxSeats" name="maxSeats" type="number" min={1} defaultValue={defaultValues?.maxSeats ?? 50} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (₹, 0 = free)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={defaultValues?.price ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={defaultValues?.status ?? "draft"} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meetingUrl">Meeting URL</Label>
        <Input id="meetingUrl" name="meetingUrl" defaultValue={defaultValues?.meetingUrl} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="recordingUrl">Recording URL</Label>
        <Input id="recordingUrl" name="recordingUrl" defaultValue={defaultValues?.recordingUrl} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--brand-blue)]">Saved</p>}
      <SubmitButton className="w-auto">Save Event</SubmitButton>
    </form>
  );
}
