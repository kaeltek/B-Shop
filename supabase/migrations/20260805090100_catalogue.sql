-- ---------------------------------------------------------------------------
-- Catalogue: categories, products, product_tags.
--
-- Money is integer cents (§2.7). There is no float anywhere in this schema and
-- there must never be one — 19.99 is not representable in binary floating point
-- and rounding drift in a total is a real bug, not a theoretical one.
-- ---------------------------------------------------------------------------

create table public.categories (
	id          uuid primary key default gen_random_uuid(),
	slug        text not null unique,
	name        text not null,
	description text,
	sort_order  int  not null default 0
);

create index categories_sort_idx on public.categories (sort_order, name);

create table public.products (
	id           uuid primary key default gen_random_uuid(),
	slug         text not null unique,
	name         text not null,
	summary      text,                                    -- one line, used on cards
	description  text,                                    -- long form, PDP
	price_cents  int  not null default 0 check (price_cents >= 0),
	currency     char(3) not null default 'EUR',
	category_id  uuid references public.categories (id) on delete set null,
	is_published boolean not null default false,
	is_available boolean not null default true,           -- in stock; independent of the commerce gate
	sort_order   int  not null default 0,
	created_at   timestamptz not null default now(),
	updated_at   timestamptz not null default now()
);

comment on column public.products.is_available is
	'Stock state. Deliberately separate from the commerce gate: a sold-out product is still a product, and gating the whole site is not the same as one item running out.';

-- The storefront's hot path is "published products, in display order", and the
-- admin list filters by category. Both get an index.
create index products_published_idx on public.products (is_published, sort_order, created_at desc);
create index products_category_idx  on public.products (category_id);

create trigger products_set_updated_at
	before update on public.products
	for each row execute function public.set_updated_at();

create table public.product_tags (
	product_id uuid references public.products (id) on delete cascade,
	tag        text not null,
	primary key (product_id, tag)
);

create index product_tags_tag_idx on public.product_tags (tag);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.product_tags enable row level security;

-- Categories are navigation furniture, not secrets, and an unpublished product
-- never exposes its category to anyone because the product row itself is hidden.
create policy "categories are publicly readable"
	on public.categories for select
	to anon, authenticated
	using (true);

create policy "admins write categories"
	on public.categories for all
	to authenticated
	using ((select public.is_admin()))
	with check ((select public.is_admin()));

-- Unpublished products are invisible to the public but must stay visible to the
-- admin console, which reads through the same anon-key client.
create policy "published products are publicly readable"
	on public.products for select
	to anon, authenticated
	using (is_published or (select public.is_admin()));

create policy "admins write products"
	on public.products for all
	to authenticated
	using ((select public.is_admin()))
	with check ((select public.is_admin()));

-- Tags inherit their product's visibility. Without this a draft product's tags
-- would leak its existence.
create policy "tags follow their product"
	on public.product_tags for select
	to anon, authenticated
	using (
		exists (
			select 1
			from public.products p
			where p.id = product_id
			  and (p.is_published or (select public.is_admin()))
		)
	);

create policy "admins write tags"
	on public.product_tags for all
	to authenticated
	using ((select public.is_admin()))
	with check ((select public.is_admin()));
