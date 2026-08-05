import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProductImage } from '$lib/types/catalogue';
import type { ProductImageRow } from './rows';

/**
 * Product image rows. All Supabase access for images lives here (§2.1).
 *
 * This module owns ROWS only. Bytes belong to the image store
 * (`src/lib/server/storage/`, P5), and the two must be kept in step by the
 * caller — see `collectStorageKeys` and the note on `deleteImage`.
 */

const SELECT = 'id, product_id, storage_key, alt_text, width, height, sort_order, is_primary';

function toImage(row: ProductImageRow): ProductImage {
	return {
		id: row.id,
		storageKey: row.storage_key,
		altText: row.alt_text,
		width: row.width,
		height: row.height,
		sortOrder: row.sort_order,
		isPrimary: row.is_primary
	};
}

export async function listImagesForProduct(
	supabase: SupabaseClient,
	productId: string
): Promise<ProductImage[]> {
	const { data, error } = await supabase
		.from('product_images')
		.select(SELECT)
		.eq('product_id', productId)
		.order('sort_order', { ascending: true })
		.returns<ProductImageRow[]>();

	if (error) throw new Error(`Failed to list images: ${error.message}`);
	return (data ?? []).map(toImage);
}

export interface NewImage {
	productId: string;
	storageKey: string;
	altText?: string;
	width: number;
	height: number;
	sortOrder?: number;
	isPrimary?: boolean;
}

/**
 * Inserts the row for an already-uploaded object.
 *
 * Call this *after* the bytes are written, and delete those bytes if this
 * throws (§4.3 step 5) — an orphaned object is invisible waste, whereas a row
 * pointing at nothing is a broken image on the storefront.
 */
export async function addImage(supabase: SupabaseClient, image: NewImage): Promise<ProductImage> {
	const { data, error } = await supabase
		.from('product_images')
		.insert({
			product_id: image.productId,
			storage_key: image.storageKey,
			alt_text: image.altText ?? '',
			width: image.width,
			height: image.height,
			sort_order: image.sortOrder ?? 0,
			is_primary: image.isPrimary ?? false
		})
		.select(SELECT)
		.single<ProductImageRow>();

	if (error) throw new Error(`Failed to record image: ${error.message}`);
	return toImage(data);
}

export async function updateImage(
	supabase: SupabaseClient,
	id: string,
	patch: { altText?: string; sortOrder?: number }
): Promise<ProductImage> {
	const payload: Record<string, unknown> = {};
	if (patch.altText !== undefined) payload.alt_text = patch.altText;
	if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;

	const { data, error } = await supabase
		.from('product_images')
		.update(payload)
		.eq('id', id)
		.select(SELECT)
		.single<ProductImageRow>();

	if (error) throw new Error(`Failed to update image: ${error.message}`);
	return toImage(data);
}

/**
 * Promotes one image to primary.
 *
 * Goes through the `set_primary_product_image` RPC so clearing the previous
 * primary and setting the new one share a transaction — `one_primary_per_product`
 * would reject the naive two-call version.
 */
export async function setPrimaryImage(supabase: SupabaseClient, imageId: string): Promise<void> {
	const { error } = await supabase.rpc('set_primary_product_image', { p_image_id: imageId });
	if (error) throw new Error(`Failed to set primary image: ${error.message}`);
}

/** Applies a new display order. `imageIds` must be in the desired order. */
export async function reorderImages(
	supabase: SupabaseClient,
	productId: string,
	imageIds: string[]
): Promise<void> {
	const updates = imageIds.map((id, index) =>
		supabase
			.from('product_images')
			.update({ sort_order: index })
			.eq('id', id)
			.eq('product_id', productId)
	);

	const results = await Promise.all(updates);
	const failed = results.find((result) => result.error);
	if (failed?.error) throw new Error(`Failed to reorder images: ${failed.error.message}`);
}

/**
 * Deletes the row and returns the storage key, so the caller can remove the
 * object. Returning it rather than deleting it here keeps this module free of
 * any dependency on the storage driver.
 */
export async function deleteImage(supabase: SupabaseClient, id: string): Promise<string | null> {
	const { data, error } = await supabase
		.from('product_images')
		.delete()
		.eq('id', id)
		.select('storage_key')
		.maybeSingle<{ storage_key: string }>();

	if (error) throw new Error(`Failed to delete image: ${error.message}`);
	return data?.storage_key ?? null;
}

/**
 * Every storage key belonging to a product.
 *
 * Read these BEFORE deleting the product: `on delete cascade` removes the rows,
 * and once they are gone there is no record of which objects to clean up
 * (§4.4 — "deleting a product must delete its objects from storage").
 */
export async function collectStorageKeys(
	supabase: SupabaseClient,
	productId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('product_images')
		.select('storage_key')
		.eq('product_id', productId)
		.returns<{ storage_key: string }[]>();

	if (error) throw new Error(`Failed to collect storage keys: ${error.message}`);
	return (data ?? []).map((row) => row.storage_key);
}
