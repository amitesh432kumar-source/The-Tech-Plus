-- The Tech Plus — initial schema
-- Core content, commerce, and engagement tables + RLS policies.

-- ── Helpers ─────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates a profile row automatically whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reads the caller's role without re-entering RLS on profiles (SECURITY DEFINER).
create or replace function public.current_user_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- ── instructors ─────────────────────────────────────────────────────────

create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  expertise text,
  bio text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_instructors_updated_at
  before update on public.instructors
  for each row execute function public.set_updated_at();

-- ── categories ──────────────────────────────────────────────────────────

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ── courses ─────────────────────────────────────────────────────────────

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  thumbnail_url text,
  category_id uuid references public.categories(id) on delete set null,
  instructor_id uuid references public.instructors(id) on delete set null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  currency text not null default 'INR',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  learning_outcomes text[] not null default '{}',
  requirements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_status_idx on public.courses (status);
create index courses_category_idx on public.courses (category_id);
create index courses_instructor_idx on public.courses (instructor_id);

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ── course_modules ──────────────────────────────────────────────────────

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index course_modules_course_idx on public.course_modules (course_id, order_index);

-- ── course_lessons ──────────────────────────────────────────────────────

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  content_type text not null default 'video' check (content_type in ('video', 'text', 'pdf', 'external', 'download')),
  content_url text,
  content_text text,
  duration_minutes int not null default 0,
  order_index int not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);

create index course_lessons_module_idx on public.course_lessons (module_id, order_index);

-- ── course_resources ────────────────────────────────────────────────────

create table public.course_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text,
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);

create index course_resources_lesson_idx on public.course_resources (lesson_id);

-- ── course_enrollments ──────────────────────────────────────────────────

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source text not null default 'purchase' check (source in ('purchase', 'coupon', 'admin')),
  last_lesson_id uuid references public.course_lessons(id) on delete set null,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index course_enrollments_student_idx on public.course_enrollments (student_id);
create index course_enrollments_course_idx on public.course_enrollments (course_id);

-- ── course_progress ─────────────────────────────────────────────────────

create table public.course_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

create index course_progress_enrollment_idx on public.course_progress (enrollment_id);

-- ── webinars ─────────────────────────────────────────────────────────────

create table public.webinars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  speaker_name text,
  speaker_bio text,
  image_url text,
  scheduled_date date not null,
  scheduled_time text not null,
  timezone text not null default 'Asia/Kolkata',
  duration_minutes int not null default 60,
  price numeric(10, 2) not null default 0,
  max_seats int not null default 100,
  meeting_url text,
  recording_url text,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'live', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index webinars_status_idx on public.webinars (status);

create trigger set_webinars_updated_at
  before update on public.webinars
  for each row execute function public.set_updated_at();

-- ── webinar_registrations ───────────────────────────────────────────────

create table public.webinar_registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  attended boolean not null default false,
  registered_at timestamptz not null default now(),
  unique (webinar_id, student_id)
);

create index webinar_registrations_webinar_idx on public.webinar_registrations (webinar_id);
create index webinar_registrations_student_idx on public.webinar_registrations (student_id);

-- ── events (workshops / bootcamps / live classes) ──────────────────────

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null default 'workshop' check (type in ('workshop', 'bootcamp', 'live-class', 'event')),
  description text,
  image_url text,
  scheduled_date date not null,
  duration_hours numeric(5, 2) not null default 1,
  price numeric(10, 2) not null default 0,
  max_seats int not null default 50,
  meeting_url text,
  recording_url text,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'live', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_status_idx on public.events (status);

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ── event_registrations ─────────────────────────────────────────────────

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, student_id)
);

create index event_registrations_event_idx on public.event_registrations (event_id);
create index event_registrations_student_idx on public.event_registrations (student_id);

-- ── coupons ──────────────────────────────────────────────────────────────

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null,
  min_amount numeric(10, 2) not null default 0,
  usage_limit int,
  times_used int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── orders ───────────────────────────────────────────────────────────────

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'refunded')),
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  coupon_id uuid references public.coupons(id) on delete set null,
  razorpay_order_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── order_items ──────────────────────────────────────────────────────────

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('course', 'webinar', 'event')),
  item_id uuid not null,
  title_snapshot text not null,
  price_snapshot numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

-- ── payments ─────────────────────────────────────────────────────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'refunded')),
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index payments_order_idx on public.payments (order_id);

-- ── coupon_usage ─────────────────────────────────────────────────────────

create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  used_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

-- ── certificates ─────────────────────────────────────────────────────────

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_code text not null unique,
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  student_name_snapshot text not null,
  course_title_snapshot text not null,
  instructor_name_snapshot text,
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index certificates_student_idx on public.certificates (student_id);

-- ── reviews ──────────────────────────────────────────────────────────────

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index reviews_course_idx on public.reviews (course_id, status);

-- ── testimonials (homepage) ─────────────────────────────────────────────

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  student_name text not null,
  student_avatar_url text,
  course_id uuid references public.courses(id) on delete set null,
  course_title text,
  rating int not null check (rating between 1 and 5),
  quote text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index testimonials_status_idx on public.testimonials (status);

-- ── faqs ─────────────────────────────────────────────────────────────────

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general',
  question text not null,
  answer text not null,
  order_index int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── notifications ────────────────────────────────────────────────────────

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read);

-- ── site_settings ────────────────────────────────────────────────────────

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
