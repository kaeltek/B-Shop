-- ---------------------------------------------------------------------------
-- Product images (§4.4) and the Storage bucket behind the `supabase` driver.
--
-- The table stores a driver-agnostic KEY, never a URL (§4.2). Everything is
-- served through /media/[...key], so switching IMAGE_STORE between `local` and
-- `supabase` touches zero rows and zero components.
-- ---------------------------------------------------------------------------

create table public.product_images (
	id          uuid primary key default gen_random_uuid(),
	product_id  uuid not null references public.products (id) on delete cascade,
	storage_key text not null unique,
	alt_text    text not null default '',
	width       int  not null check (width  > 0),
	height      int  not null check (height > 0),
	sort_order  int  not null default 0,
	is_primary  boolean not null default false,
	created_at  timestamptz not null default now()
);

comment on column public.product_images.storage_key is
	'Driver-relative key, e.g. products/<product-id>/<uuid>-1600.webp. Never a URL — see ARCHITECTURE.md §image storage.';

comment on column public.product_images.width is
	'Intrinsic pixel width of the largest variant. Rendered as the width attribute so the browser can reserve space and avoid layout shift.';

-- At most one primary image per product, enforced by the database rather than
-- by application code that could race with itself.
create unique index one_primary_per_product
	on public.product_images (product_id)
	where is_primary;

create index product_images_product_idx
	on public.product_images (product_id, sort_order);

alter table public.product_images enable row level security;

create policy "images follow their product"
	on public.product_images for select
	to anon, authenticated
	using (
		exists (
			select 1
			from public.products p
			where p.id = product_id
			  and (p.is_published or (select public.is_admin()))
		)
	);

create policy "admins write images"
	on public.product_images for all
	to authenticated
	using ((select public.is_admin()))
	with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Promoting an image to primary.
--
-- `one_primary_per_product` means clearing the old primary and setting the new
-- one must happen together. PostgREST cannot span two statements in a
-- transaction, so this is an RPC rather than two calls from the client, which
-- could otherwise fail halfway and leave a product with no primary image.
--
-- SECURITY INVOKER, deliberately: RLS still applies, so a non-admin calling
-- this updates nothing instead of escalating through it.
-- ---------------------------------------------------------------------------

create or replace function public.set_primary_product_image(p_image_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
	target_product uuid;
begin
	select product_id into target_product
	from public.product_images
	where id = p_image_id;

	if target_product is null then
		raise exception 'Image % not found', p_image_id using errcode = 'no_data_found';
	end if;

	update public.product_images
	set is_primary = false
	where product_id = target_product
	  and is_primary
	  and id <> p_image_id;

	update public.product_images
	set is_primary = true
	where id = p_image_id;
end;
$$;

grant execute on function public.set_primary_product_image(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for the `supabase` image driver.
--
-- Public-read so /media/[...key] can 302 to the object rather than proxying
-- bytes through a serverless function. Writes are admin-only.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images are publicly readable"
	on storage.objects for select
	to anon, authenticated
	using (bucket_id = 'product-images');

create policy "admins upload product images"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins update product images"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'product-images' and (select public.is_admin()))
	with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins delete product images"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'product-images' and (select public.is_admin()));
