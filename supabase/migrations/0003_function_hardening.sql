-- Harden functions flagged by the Supabase security advisor.
--
-- Note: current_user_role()/is_admin() are intentionally left callable by
-- anon/authenticated — they're invoked from RLS policies on publicly
-- readable tables (e.g. anonymous course browsing), so revoking EXECUTE
-- would break those policy checks. Both are safe to expose: they only
-- ever report on the calling user's own row (auth.uid()).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user is a trigger-only function (auth.users insert) — it
-- should never be called directly via the PostgREST RPC endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
