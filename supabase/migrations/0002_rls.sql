-- The Tech Plus — Row Level Security
-- Every table gets RLS enabled. Client access (anon/authenticated) is
-- limited to what a visitor/student/instructor should legitimately see or
-- write; server-side privileged writes (payments, enrollments after
-- purchase, publishing) use the service-role client which bypasses RLS.

alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_resources enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_progress enable row level security;
alter table public.webinars enable row level security;
alter table public.webinar_registrations enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.certificates enable row level security;
alter table public.reviews enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.notifications enable row level security;
alter table public.site_settings enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy "profiles_admin_manage" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── instructors ─────────────────────────────────────────────────────────

create policy "instructors_public_read" on public.instructors
  for select using (true);

create policy "instructors_admin_write" on public.instructors
  for all using (public.is_admin()) with check (public.is_admin());

-- ── categories ──────────────────────────────────────────────────────────

create policy "categories_public_read" on public.categories
  for select using (true);

create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── courses ─────────────────────────────────────────────────────────────

create policy "courses_public_read_published" on public.courses
  for select using (status = 'published' or public.is_admin());

create policy "courses_admin_write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- ── course_modules / lessons / resources ───────────────────────────────
-- Readable when the parent course is published; lesson content itself is
-- still gated to preview lessons or enrolled students at the app layer for
-- anything sensitive (video/content URLs) — the service-role client is
-- used there instead of relying on RLS alone for signed URLs.

create policy "course_modules_read" on public.course_modules
  for select using (
    public.is_admin()
    or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );

create policy "course_modules_admin_write" on public.course_modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "course_lessons_read_preview_or_enrolled" on public.course_lessons
  for select using (
    public.is_admin()
    or is_preview = true
    or exists (
      select 1
      from public.course_modules m
      join public.course_enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.student_id = auth.uid()
    )
  );

create policy "course_lessons_admin_write" on public.course_lessons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "course_resources_read_enrolled" on public.course_resources
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.course_lessons l
      join public.course_modules m on m.id = l.module_id
      join public.course_enrollments e on e.course_id = m.course_id
      where l.id = lesson_id and e.student_id = auth.uid()
    )
  );

create policy "course_resources_admin_write" on public.course_resources
  for all using (public.is_admin()) with check (public.is_admin());

-- ── course_enrollments ──────────────────────────────────────────────────
-- Created server-side (service role) once payment is verified — students
-- can only read their own; admins manage all.

create policy "course_enrollments_select_own_or_admin" on public.course_enrollments
  for select using (student_id = auth.uid() or public.is_admin());

create policy "course_enrollments_update_own_progress_pointer" on public.course_enrollments
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "course_enrollments_admin_write" on public.course_enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- ── course_progress ─────────────────────────────────────────────────────

create policy "course_progress_select_own_or_admin" on public.course_progress
  for select using (
    public.is_admin()
    or exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.student_id = auth.uid())
  );

create policy "course_progress_insert_own" on public.course_progress
  for insert with check (
    exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.student_id = auth.uid())
  );

create policy "course_progress_admin_write" on public.course_progress
  for all using (public.is_admin()) with check (public.is_admin());

-- ── webinars / events (public listings) ─────────────────────────────────

create policy "webinars_public_read" on public.webinars
  for select using (status <> 'draft' or public.is_admin());

create policy "webinars_admin_write" on public.webinars
  for all using (public.is_admin()) with check (public.is_admin());

create policy "events_public_read" on public.events
  for select using (status <> 'draft' or public.is_admin());

create policy "events_admin_write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ── webinar_registrations / event_registrations ────────────────────────
-- Self-registration allowed client-side (covers free webinars/events);
-- paid ones are additionally recorded server-side after payment.

create policy "webinar_registrations_select_own_or_admin" on public.webinar_registrations
  for select using (student_id = auth.uid() or public.is_admin());

create policy "webinar_registrations_insert_own" on public.webinar_registrations
  for insert with check (student_id = auth.uid());

create policy "webinar_registrations_admin_write" on public.webinar_registrations
  for all using (public.is_admin()) with check (public.is_admin());

create policy "event_registrations_select_own_or_admin" on public.event_registrations
  for select using (student_id = auth.uid() or public.is_admin());

create policy "event_registrations_insert_own" on public.event_registrations
  for insert with check (student_id = auth.uid());

create policy "event_registrations_admin_write" on public.event_registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- ── coupons / coupon_usage ───────────────────────────────────────────────
-- No client-side select: codes are validated through a server route
-- (service role) so discount logic and eligibility stay server-authoritative.

create policy "coupons_admin_only" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "coupon_usage_select_own_or_admin" on public.coupon_usage
  for select using (user_id = auth.uid() or public.is_admin());

create policy "coupon_usage_admin_write" on public.coupon_usage
  for all using (public.is_admin()) with check (public.is_admin());

-- ── orders / order_items / payments ─────────────────────────────────────
-- A user may create their own pending order (checkout start), but only the
-- service role (webhook/verification route) can mark it paid/failed.

create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_own" on public.orders
  for insert with check (user_id = auth.uid());

create policy "orders_admin_write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "order_items_admin_write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments_select_own_or_admin" on public.payments
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "payments_admin_write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- ── certificates ─────────────────────────────────────────────────────────
-- Public select is intentional: /verify/[certificateId] must work for
-- anonymous visitors verifying a certificate by its unique code.

create policy "certificates_public_read" on public.certificates
  for select using (true);

create policy "certificates_admin_write" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- ── reviews ──────────────────────────────────────────────────────────────

create policy "reviews_read_approved_or_own_or_admin" on public.reviews
  for select using (status = 'approved' or student_id = auth.uid() or public.is_admin());

create policy "reviews_insert_own" on public.reviews
  for insert with check (
    student_id = auth.uid()
    and exists (select 1 from public.course_enrollments e where e.student_id = auth.uid() and e.course_id = reviews.course_id)
  );

create policy "reviews_update_own_pending" on public.reviews
  for update using (student_id = auth.uid() and status = 'pending')
  with check (student_id = auth.uid());

create policy "reviews_admin_write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ── testimonials ─────────────────────────────────────────────────────────

create policy "testimonials_read_approved_or_admin" on public.testimonials
  for select using (status = 'approved' or public.is_admin());

create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- ── faqs ─────────────────────────────────────────────────────────────────

create policy "faqs_public_read_published" on public.faqs
  for select using (published = true or public.is_admin());

create policy "faqs_admin_write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- ── notifications ────────────────────────────────────────────────────────

create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_admin_write" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- ── site_settings ────────────────────────────────────────────────────────

create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());
