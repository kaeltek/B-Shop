-- ---------------------------------------------------------------------------
-- Newsletter signups (§8.10).
--
-- The homepage form validates server-side, carries a honeypot and is rate
-- limited. It needs somewhere to put a successful signup — a form that
-- validates and then discards the address is a stub, not a feature.
-- ---------------------------------------------------------------------------

create table public.newsletter_subscribers (
	id           uuid primary key default gen_random_uuid(),
	email        text not null unique,
	consented_at timestamptz not null default now(),
	-- Truncated to a /24 (or /64) before it is stored: enough to rate limit an
	-- abusive source, not enough to identify a person. GDPR data minimisation.
	source_prefix text,
	created_at   timestamptz not null default now()
);

comment on column public.newsletter_subscribers.consented_at is
	'When the consent checkbox was ticked. Consent is required before submit, so this is never null — it exists to evidence the opt-in, not to record an optional extra.';

create index newsletter_subscribers_created_idx
	on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- No anon policy at all. Signups are written by the server through the
-- service-role client after validation; letting the browser INSERT directly
-- would hand anyone an unauthenticated write endpoint and make the honeypot
-- and rate limit trivially bypassable.
create policy "admins read subscribers"
	on public.newsletter_subscribers for select
	to authenticated
	using ((select public.is_admin()));

create policy "admins delete subscribers"
	on public.newsletter_subscribers for delete
	to authenticated
	using ((select public.is_admin()));
