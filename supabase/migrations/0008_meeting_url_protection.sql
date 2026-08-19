-- Meeting links (Zoom/Meet URLs) and recording links must not be visible
-- to anyone who hasn't registered — the previous row-level policy exposed
-- the entire webinars/events row, including meeting_url/recording_url, to
-- any visitor. Same pattern as 0007_lesson_visibility.sql: keep row access
-- public (needed for the marketing page), withhold the two sensitive
-- columns at the grant level, and serve them server-side (service-role
-- client) only after confirming the caller is registered or an admin.

revoke select on public.webinars from anon, authenticated;
grant select (
  id, slug, title, description, speaker_name, speaker_bio, image_url,
  scheduled_date, scheduled_time, timezone, duration_minutes, price,
  max_seats, status, created_at, updated_at
) on public.webinars to anon, authenticated;

revoke select on public.events from anon, authenticated;
grant select (
  id, slug, title, type, description, image_url, scheduled_date,
  duration_hours, price, max_seats, status, created_at, updated_at
) on public.events to anon, authenticated;
