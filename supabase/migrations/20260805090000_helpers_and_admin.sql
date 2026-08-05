-- ---------------------------------------------------------------------------
-- Admin identity and shared helpers.
--
-- Every write policy in this schema funnels through is_admin(). Keeping that in
-- one function means adding a table later cannot accidentally invent its own,
-- looser, definition of "admin".
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
	user_id    uuid primary key references auth.users (id) on delete cascade,
	created_at timestamptz not null default now(),
	note       text
);

comment on table public.admin_users is
	'Allow-list of users with admin console access. Populated manually or via the Supabase dashboard — there is deliberately no self-service path in.';

alter table public.admin_users enable row level security;

-- SECURITY DEFINER is load-bearing. admin_users has RLS enabled, so a plain
-- function called from another table's policy would be subject to admin_users'
-- own policies, recurse, and evaluate to false for everyone. Running as the
-- definer lets the lookup see the row while callers still cannot read the table
-- directly.
--
-- search_path is pinned so a caller cannot shadow `admin_users` with a
-- same-named object in a schema they control.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
	select exists (
		select 1
		from public.admin_users a
		where a.user_id = (select auth.uid())
	);
$$;

comment on function public.is_admin() is
	'True when the calling user is in admin_users. Used by every write policy.';

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Admins can see the admin list; nobody else can, and nobody edits it through
-- the API at all (no insert/update/delete policy exists).
create policy "admins read the admin list"
	on public.admin_users
	for select
	to authenticated
	using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

comment on function public.set_updated_at() is
	'BEFORE UPDATE trigger: stamps updated_at so callers cannot forget or forge it.';
