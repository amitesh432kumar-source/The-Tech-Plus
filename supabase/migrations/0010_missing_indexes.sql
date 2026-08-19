-- Foreign keys flagged by the Supabase performance advisor as missing a
-- covering index — left unindexed, joins/lookups through these columns
-- degrade to sequential scans as the tables grow.

create index certificates_course_id_idx on public.certificates (course_id);
create index coupon_usage_order_id_idx on public.coupon_usage (order_id);
create index coupon_usage_user_id_idx on public.coupon_usage (user_id);
create index course_enrollments_last_lesson_id_idx on public.course_enrollments (last_lesson_id);
create index course_progress_lesson_id_idx on public.course_progress (lesson_id);
create index orders_coupon_id_idx on public.orders (coupon_id);
create index testimonials_course_id_idx on public.testimonials (course_id);
create index testimonials_student_id_idx on public.testimonials (student_id);
