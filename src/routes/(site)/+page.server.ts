import type { PageServerLoad } from './$types';
import { listFeaturedProducts, listProducts } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import { mediaSrcset, mediaUrl } from '$lib/utils/media';
import { primaryImage, type Category, type Product } from '$lib/types/catalogue';
import type { StripTile } from '$lib/types/home';

/** Tiles in the strip that closes the homepage — six across at the widest. */
const STRIP_TILES = 6;

/**
 * The packaging category, found without hardcoding a slug.
 *
 * Its slug in the database predates the name it now carries, and an admin can
 * rename either from `/admin/categories`. Matching the name first means the
 * strip follows the category an admin actually sees; the slug is the fallback.
 * Neither matching is an error — the strip falls back to placeholder artwork.
 */
function findPackagingCategory(categories: Category[]): Category | undefined {
	return (
		categories.find((category) => /packag/i.test(category.name)) ??
		categories.find((category) => /packag/i.test(category.slug))
	);
}

/** Products carry several images; the strip shows each one's primary. */
function toStripTiles(products: Product[]): StripTile[] {
	const tiles: StripTile[] = [];

	for (const product of products) {
		const image = primaryImage(product);
		if (!image) continue;

		tiles.push({
			id: image.id,
			src: mediaUrl(image.storageKey),
			srcset: mediaSrcset(image.storageKey),
			alt: image.altText || product.name
		});

		if (tiles.length === STRIP_TILES) break;
	}

	return tiles;
}

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!isSupabaseConfigured()) {
		return { featured: [] as Product[], packagingTiles: [] as StripTile[] };
	}

	// The layout has already loaded the categories for the nav. Reading them
	// through `parent()` keeps this to one query for the same answer.
	const { categories } = await parent();
	const packaging = findPackagingCategory(categories);

	const [featured, packagingProducts] = await Promise.all([
		listFeaturedProducts(locals.supabase, 3).catch((cause) => {
			console.error('[home] featured products failed:', cause);
			return [] as Product[];
		}),
		packaging
			? // Twice the tiles it needs, so products still waiting on a photograph
				// do not leave gaps in the row.
				listProducts(locals.supabase, {
					categorySlug: packaging.slug,
					sort: 'curated',
					limit: STRIP_TILES * 2
				}).catch((cause) => {
					console.error('[home] packaging products failed:', cause);
					return [] as Product[];
				})
			: []
	]);

	return { featured, packagingTiles: toStripTiles(packagingProducts) };
};
