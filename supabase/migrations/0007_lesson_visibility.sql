-- Course syllabus should be publicly visible (lesson titles, durations,
-- ordering) the way any course marketplace shows what's inside before you
-- buy — while the actual lesson *content* stays locked to enrolled students.
--
-- The previous row-level policy hid entire non-preview lesson rows from
-- anonymous visitors, which also hid the curriculum and broke lesson
-- counts/durations on public pages. Replace it with:
--   row level  → any lesson of a published course is readable
--   column level → content_url / content_text are NOT granted to
--                  anon/authenticated, so the payload stays protected
-- Enrolled-student access to content goes through the server (service-role
-- client) after an enrollment check, in the course player phase.

drop policy if exists "course_lessons_read_preview_or_enrolled" on public.course_lessons;

create policy "course_lessons_read_published_course" on public.course_lessons
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.course_modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.status = 'published'
    )
  );

-- Column-level protection for the actual lesson payload.
revoke select on public.course_lessons from anon, authenticated;
grant select (
  id, module_id, title, content_type, duration_minutes, order_index,
  is_preview, created_at
) on public.course_lessons to anon, authenticated;
