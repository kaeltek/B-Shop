/**
 * Shared domain types (§2.4).
 *
 * These are the shapes the application reasons about — camelCase, no database
 * concerns leaking through. They are deliberately NOT generated: the generated
 * file describes table rows, and mapping rows to these types is what
 * `src/lib/server/db/` exists to do.
 */

export interface Category {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	sortOrder: number;
}

export interface ProductImage {
	id: string;
	/**
	 * Driver-relative storage key, never a URL (§4.2). Build a src with
	 * `mediaUrl(key)`; do not concatenate a host onto it by hand.
	 */
	storageKey: string;
	altText: string;
	width: number;
	height: number;
	sortOrder: number;
	isPrimary: boolean;
}

export interface Product {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	description: string | null;
	/** Integer minor units (§2.7). Never a float, never a formatted string. */
	priceCents: number;
	/** ISO 4217, e.g. 'EUR'. */
	currency: string;
	categoryId: string | null;
	isPublished: boolean;
	/** In stock. Independent of the commerce gate. */
	isAvailable: boolean;
	sortOrder: number;
	tags: string[];
	images: ProductImage[];
}

/**
 * The commerce gate as the UI consumes it. Produced by the root layout load and
 * read through context — see §3.2 and §3.4.
 */
export interface CommerceSettings {
	enabled: boolean;
	/** Whether prices render while gated. Meaningless when `enabled` is true. */
	showPrices: boolean;
	/** Optional banner copy shown in gated mode. */
	notice: string | null;
}

/** Convenience: the image to lead with, or null when a product has none. */
export function primaryImage(product: Product): ProductImage | null {
	return product.images.find((image) => image.isPrimary) ?? product.images[0] ?? null;
}
