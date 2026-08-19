-- Performance pass flagged by the Supabase advisor: RLS policies calling
-- auth.uid() directly get re-evaluated once per row instead of once per
-- query. Wrapping in (select auth.uid()) lets Postgres treat it as a
-- stable subquery and cache the result. Same treatment for
-- public.is_admin()/public.current_user_role() for consistency, even
-- where not explicitly flagged, since the same caching benefit applies.
--
-- This migration only rewrites the 22 flagged policies (drop + recreate
-- with identical logic, just the wrapped function calls) — it does not
-- change access rules.

-- profiles
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = (select auth.uid()) or (select public.is_admin()));

drop policy "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = (select auth.uid()) or (select public.is_admin()));

-- course_resources
drop policy "course_resources_read_enrolled" on public.course_resources;
create policy "course_resources_read_enrolled" on public.course_resources
  for select using (
    (select public.is_admin())
    or exists (
      select 1
      from public.course_lessons l
      join public.course_modules m on m.id = l.module_id
      join public.course_enrollments e on e.course_id = m.course_id
      where l.id = lesson_id and e.student_id = (select auth.uid())
    )
  );

-- course_enrollments
drop policy "course_enrollments_select_own_or_admin" on public.course_enrollments;
create policy "course_enrollments_select_own_or_admin" on public.course_enrollments
  for select using (student_id = (select auth.uid()) or (select public.is_admin()));

drop policy "course_enrollments_update_own_progress_pointer" on public.course_enrollments;
create policy "course_enrollments_update_own_progress_pointer" on public.course_enrollments
  for update using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

-- course_progress
drop policy "course_progress_select_own_or_admin" on public.course_progress;
create policy "course_progress_select_own_or_admin" on public.course_progress
  for select using (
    (select public.is_admin())
    or exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.student_id = (select auth.uid()))
  );

drop policy "course_progress_insert_own" on public.course_progress;
create policy "course_progress_insert_own" on public.course_progress
  for insert with check (
    exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.student_id = (select auth.uid()))
  );

-- webinar_registrations
drop policy "webinar_registrations_select_own_or_admin" on public.webinar_registrations;
create policy "webinar_registrations_select_own_or_admin" on public.webinar_registrations
  for select using (student_id = (select auth.uid()) or (select public.is_admin()));

drop policy "webinar_registrations_insert_own" on public.webinar_registrations;
create policy "webinar_registrations_insert_own" on public.webinar_registrations
  for insert with check (student_id = (select auth.uid()));

-- event_registrations
drop policy "event_registrations_select_own_or_admin" on public.event_registrations;
create policy "event_registrations_select_own_or_admin" on public.event_registrations
  for select using (student_id = (select auth.uid()) or (select public.is_admin()));

drop policy "event_registrations_insert_own" on public.event_registrations;
create policy "event_registrations_insert_own" on public.event_registrations
  for insert with check (student_id = (select auth.uid()));

-- coupon_usage
drop policy "coupon_usage_select_own_or_admin" on public.coupon_usage;
create policy "coupon_usage_select_own_or_admin" on public.coupon_usage
  for select using (user_id = (select auth.uid()) or (select public.is_admin()));

-- orders
drop policy "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (user_id = (select auth.uid()));

-- order_items
drop policy "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    (select public.is_admin())
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

drop policy "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- payments
drop policy "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin" on public.payments
  for select using (
    (select public.is_admin())
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- reviews
drop policy "reviews_read_approved_or_own_or_admin" on public.reviews;
create policy "reviews_read_approved_or_own_or_admin" on public.reviews
  for select using (status = 'approved' or student_id = (select auth.uid()) or (select public.is_admin()));

drop policy "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.course_enrollments e
      where e.student_id = (select auth.uid()) and e.course_id = reviews.course_id
    )
  );

drop policy "reviews_update_own_pending" on public.reviews;
create policy "reviews_update_own_pending" on public.reviews
  for update using (student_id = (select auth.uid()) and status = 'pending')
  with check (student_id = (select auth.uid()));

-- notifications
drop policy "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = (select auth.uid()));

drop policy "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
