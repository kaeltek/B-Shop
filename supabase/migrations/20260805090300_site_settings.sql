-- ---------------------------------------------------------------------------
-- Site settings (§3.1) — the commerce gate.
--
-- Enforced singleton: the primary key is a boolean with a CHECK that pins it to
-- true, so a second row is impossible rather than merely discouraged.
-- ---------------------------------------------------------------------------

create table public.site_settings (
	id                     boolean primary key default true check (id),
	commerce_enabled       boolean not null default false,
	show_prices_when_gated boolean not null default false,
	gated_notice           text,
	updated_at             timestamptz not null default now(),
	updated_by             uuid references auth.users (id)
);

comment on table public.site_settings is
	'Single row. commerce_enabled drives the whole public site between shop and catalogue mode.';

comment on column public.site_settings.commerce_enabled is
	'Defaults to FALSE. A fresh deployment is a catalogue until someone deliberately turns commerce on — failing closed is the safe direction for a payment surface.';

create table public.site_settings_audit (
	id         bigserial primary key,
	changed_at timestamptz not null default now(),
	changed_by uuid references auth.users (id),
	field      text not null,
	old_value  text,
	new_value  text
);

create index site_settings_audit_changed_at_idx
	on public.site_settings_audit (changed_at desc);

-- The singleton itself. Created here rather than in seed.sql because the
-- application requires this row to exist in every environment — a seed is
-- optional sample data, this is part of the schema's contract.
insert into public.site_settings (id) values (true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Audit trigger
--
-- One row per changed field, written by the database. Doing this in application
-- code would mean an admin action that bypassed the app — a dashboard edit, a
-- psql session — left no trace.
-- ---------------------------------------------------------------------------

create or replace function public.log_site_settings_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
	actor uuid := (select auth.uid());
begin
	if new.commerce_enabled is distinct from old.commerce_enabled then
		insert into public.site_settings_audit (changed_by, field, old_value, new_value)
		values (actor, 'commerce_enabled', old.commerce_enabled::text, new.commerce_enabled::text);
	end if;

	if new.show_prices_when_gated is distinct from old.show_prices_when_gated then
		insert into public.site_settings_audit (changed_by, field, old_value, new_value)
		values (actor, 'show_prices_when_gated', old.show_prices_when_gated::text, new.show_prices_when_gated::text);
	end if;

	if new.gated_notice is distinct from old.gated_notice then
		insert into public.site_settings_audit (changed_by, field, old_value, new_value)
		values (actor, 'gated_notice', old.gated_notice, new.gated_notice);
	end if;

	-- Stamped server-side so the client cannot lie about who flipped the gate.
	new.updated_at := now();
	new.updated_by := actor;
	return new;
end;
$$;

create trigger site_settings_audit_trigger
	before update on public.site_settings
	for each row execute function public.log_site_settings_change();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.site_settings       enable row level security;
alter table public.site_settings_audit enable row level security;

-- Public read: every page load needs the gate state, including anonymous ones.
-- Nothing here is sensitive — it describes what the site already visibly is.
create policy "settings are publicly readable"
	on public.site_settings for select
	to anon, authenticated
	using (true);

create policy "admins update settings"
	on public.site_settings for update
	to authenticated
	using ((select public.is_admin()))
	with check ((select public.is_admin()));

-- No insert or delete policy: the row is a singleton created by this migration
-- and must not be creatable or removable through the API.

create policy "admins read the audit log"
	on public.site_settings_audit for select
	to authenticated
	using ((select public.is_admin()));

-- No insert policy either. Audit rows arrive only through the SECURITY DEFINER
-- trigger above, so the log cannot be forged or back-filled through PostgREST.
