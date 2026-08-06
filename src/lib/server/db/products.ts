import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { Product } from '$lib/types/catalogue';
import type { ProductImageRow, ProductRow, ProductUpdate } from './rows';

/**
 * Product reads and writes. All Supabase access for products lives here (§2.1).
 *
 * Visibility is NOT filtered in this module. `is_published` is enforced by the
 * RLS policy in 20260805090100_catalogue.sql, so an anonymous caller cannot see
 * a draft even if a query here forgets to exclude it, and an admin sees drafts
 * through the same functions without a second code path.
 */

const SELECT = `
	id, slug, name, summary, description, price_cents, currency, category_id,
	is_published, is_available, sort_order,
	product_tags ( tag ),
	product_images ( id, product_id, storage_key, alt_text, width, height, sort_order, is_primary )
`;

function toProduct(row: ProductRow): Product {
	const images = (row.product_images ?? [])
		.slice()
		.sort((a: ProductImageRow, b: ProductImageRow) => a.sort_order - b.sort_order)
		.map((image) => ({
			id: image.id,
			storageKey: image.storage_key,
			altText: image.alt_text,
			width: image.width,
			height: image.height,
			sortOrder: image.sort_order,
			isPrimary: image.is_primary
		}));

	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		summary: row.summary,
		description: row.description,
		priceCents: row.price_cents,
		currency: row.currency,
		categoryId: row.category_id,
		isPublished: row.is_published,
		isAvailable: row.is_available,
		sortOrder: row.sort_order,
		tags: (row.product_tags ?? []).map((t) => t.tag).sort(),
		images
	};
}

export type ProductSort = 'curated' | 'newest' | 'price-asc' | 'price-desc' | 'name';

export interface ListProductsOptions {
	/** Filter to one category by slug. */
	categorySlug?: string;
	/** Filter to products carrying this tag. */
	tag?: string;
	sort?: ProductSort;
	limit?: number;
	offset?: number;
}

export async function listProducts(
	supabase: SupabaseClient<Database>,
	options: ListProductsOptions = {}
): Promise<Product[]> {
	const { categorySlug, tag, sort = 'curated', limit, offset } = options;

	let query = supabase.from('products').select(SELECT);

	if (categorySlug) {
		// PostgREST filters on an embedded resource without needing a join here.
		const { data: category, error: categoryError } = await supabase
			.from('categories')
			.select('id')
			.eq('slug', categorySlug)
			.maybeSingle<{ id: string }>();

		if (categoryError) {
			throw new Error(`Failed to resolve category "${categorySlug}": ${categoryError.message}`);
		}
		// An unknown category slug means an empty catalogue, not every product.
		if (!category) return [];

		query = query.eq('category_id', category.id);
	}

	if (tag) {
		query = query.eq('product_tags.tag', tag).not('product_tags', 'is', null);
	}

	switch (sort) {
		case 'newest':
			query = query.order('created_at', { ascending: false });
			break;
		case 'price-asc':
			query = query.order('price_cents', { ascending: true });
			break;
		case 'price-desc':
			query = query.order('price_cents', { ascending: false });
			break;
		case 'name':
			query = query.order('name', { ascending: true });
			break;
		case 'curated':
		default:
			query = query.order('sort_order', { ascending: true }).order('name', { ascending: true });
			break;
	}

	if (limit !== undefined) {
		query = query.range(offset ?? 0, (offset ?? 0) + limit - 1);
	} else if (offset !== undefined) {
		query = query.range(offset, offset + 999);
	}

	const { data, error } = await query.returns<ProductRow[]>();
	if (error) throw new Error(`Failed to list products: ${error.message}`);

	return (data ?? []).map(toProduct);
}

/**
 * The homepage's featured grid (§8.5).
 *
 * There is no `is_featured` column — the spec's schema does not define one — so
 * "featured" means "first N in curated order". Editors control it with
 * sort_order, which is the same lever they already use everywhere else. If this
 * ever needs to diverge from catalogue order, add the column then.
 */
export async function listFeaturedProducts(
	supabase: SupabaseClient<Database>,
	limit = 3
): Promise<Product[]> {
	return listProducts(supabase, { sort: 'curated', limit });
}

export async function getProductBySlug(
	supabase: SupabaseClient<Database>,
	slug: string
): Promise<Product | null> {
	const { data, error } = await supabase
		.from('products')
		.select(SELECT)
		.eq('slug', slug)
		.maybeSingle<ProductRow>();

	if (error) throw new Error(`Failed to load product "${slug}": ${error.message}`);
	return data ? toProduct(data) : null;
}

export async function getProductById(
	supabase: SupabaseClient<Database>,
	id: string
): Promise<Product | null> {
	const { data, error } = await supabase
		.from('products')
		.select(SELECT)
		.eq('id', id)
		.maybeSingle<ProductRow>();

	if (error) throw new Error(`Failed to load product ${id}: ${error.message}`);
	return data ? toProduct(data) : null;
}

/** Every distinct tag in use, for the shop filter bar. */
export async function listTags(supabase: SupabaseClient<Database>): Promise<string[]> {
	const { data, error } = await supabase
		.from('product_tags')
		.select('tag')
		.returns<{ tag: string }[]>();

	if (error) throw new Error(`Failed to list tags: ${error.message}`);
	return [...new Set((data ?? []).map((row) => row.tag))].sort();
}

export interface ProductInput {
	slug: string;
	name: string;
	summary?: string | null;
	description?: string | null;
	priceCents: number;
	currency?: string;
	categoryId?: string | null;
	isPublished?: boolean;
	isAvailable?: boolean;
	sortOrder?: number;
}

function toPayload(input: Partial<ProductInput>): ProductUpdate {
	const payload: ProductUpdate = {};
	if (input.slug !== undefined) payload.slug = input.slug;
	if (input.name !== undefined) payload.name = input.name;
	if (input.summary !== undefined) payload.summary = input.summary;
	if (input.description !== undefined) payload.description = input.description;
	if (input.priceCents !== undefined) payload.price_cents = input.priceCents;
	if (input.currency !== undefined) payload.currency = input.currency;
	if (input.categoryId !== undefined) payload.category_id = input.categoryId;
	if (input.isPublished !== undefined) payload.is_published = input.isPublished;
	if (input.isAvailable !== undefined) payload.is_available = input.isAvailable;
	if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
	return payload;
}

export async function createProduct(
	supabase: SupabaseClient<Database>,
	input: ProductInput
): Promise<Product> {
	// Built explicitly rather than through toPayload: slug and name are required
	// on insert but optional on update, so the two payloads are not the same
	// type and collapsing them would lose that distinction.
	const { data, error } = await supabase
		.from('products')
		.insert({
			slug: input.slug,
			name: input.name,
			summary: input.summary ?? null,
			description: input.description ?? null,
			price_cents: input.priceCents,
			currency: input.currency ?? 'EUR',
			category_id: input.categoryId ?? null,
			is_published: input.isPublished ?? false,
			is_available: input.isAvailable ?? true,
			sort_order: input.sortOrder ?? 0
		})
		.select(SELECT)
		.single<ProductRow>();

	if (error) throw new Error(`Failed to create product: ${error.message}`);
	return toProduct(data);
}

export async function updateProduct(
	supabase: SupabaseClient<Database>,
	id: string,
	input: Partial<ProductInput>
): Promise<Product> {
	const payload = toPayload(input);
	if (Object.keys(payload).length === 0) {
		const existing = await getProductById(supabase, id);
		if (!existing) throw new Error(`Product ${id} not found`);
		return existing;
	}

	const { data, error } = await supabase
		.from('products')
		.update(payload)
		.eq('id', id)
		.select(SELECT)
		.single<ProductRow>();

	if (error) throw new Error(`Failed to update product: ${error.message}`);
	return toProduct(data);
}

/** Replaces a product's tag set wholesale. */
export async function setProductTags(
	supabase: SupabaseClient<Database>,
	productId: string,
	tags: string[]
): Promise<void> {
	const wanted = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

	const { error: deleteError } = await supabase
		.from('product_tags')
		.delete()
		.eq('product_id', productId);
	if (deleteError) throw new Error(`Failed to clear tags: ${deleteError.message}`);

	if (wanted.length === 0) return;

	const { error: insertError } = await supabase
		.from('product_tags')
		.insert(wanted.map((tag) => ({ product_id: productId, tag })));
	if (insertError) throw new Error(`Failed to write tags: ${insertError.message}`);
}

/**
 * Deletes the product row. Image ROWS cascade via the foreign key, but the
 * storage OBJECTS do not — the caller must delete those through the image store
 * first or they are orphaned. `deleteProductWithImages` in ./images.ts does both
 * in the right order; prefer it.
 */
export async function deleteProduct(supabase: SupabaseClient<Database>, id: string): Promise<void> {
	const { error } = await supabase.from('products').delete().eq('id', id);
	if (error) throw new Error(`Failed to delete product: ${error.message}`);
}
