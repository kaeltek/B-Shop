import type { Database } from '$lib/types/database';

/**
 * Row types, derived from the CLI-generated schema (§2.4).
 *
 * These are aliases, not hand-written shapes: regenerate with `npm run db:types`
 * after any migration and every module below picks the change up. If a column
 * is renamed or dropped, `svelte-check` fails here rather than at runtime.
 *
 * PostgREST embeds are the one thing the generator cannot express — a
 * `select()` with a nested resource returns the parent row plus the embedded
 * arrays — so those are composed explicitly.
 */

type Tables = Database['public']['Tables'];

export type CategoryRow = Tables['categories']['Row'];
export type ProductImageRow = Tables['product_images']['Row'];

/** `products` with the tags and images the storefront select embeds. */
export type ProductRow = Tables['products']['Row'] & {
	product_tags?: { tag: string }[] | null;
	product_images?: ProductImageRow[] | null;
};

/** Only the columns `getSettings` asks for. */
export type SiteSettingsRow = Pick<
	Tables['site_settings']['Row'],
	'commerce_enabled' | 'show_prices_when_gated' | 'gated_notice'
>;

/**
 * Write payloads.
 *
 * Using these instead of `Record<string, unknown>` is what makes a typo in a
 * column name a compile error rather than a silent no-op at runtime — PostgREST
 * happily accepts an unknown key and ignores it.
 */
export type ProductInsert = Tables['products']['Insert'];
export type ProductUpdate = Tables['products']['Update'];
export type CategoryUpdate = Tables['categories']['Update'];
export type ProductImageUpdate = Tables['product_images']['Update'];
export type SiteSettingsUpdate = Tables['site_settings']['Update'];
