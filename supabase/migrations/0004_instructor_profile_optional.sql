-- Allow an instructor "creator profile" to exist without a linked platform
-- login (auth.users row). Admin-managed instructor listings are common in
-- EdTech even when the instructor doesn't personally log into the site.
alter table public.instructors
  alter column profile_id drop not null;

alter table public.instructors
  add column display_name text,
  add column avatar_url text;

alter table public.instructors
  add constraint instructors_has_identity
  check (profile_id is not null or display_name is not null);
