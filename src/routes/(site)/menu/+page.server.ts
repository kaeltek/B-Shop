import type { PageServerLoad } from './$types';
import { listProducts } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import type { Category, Product } from '$lib/types/catalogue';

/**
 * The menu is the catalogue, grouped by category and set as a list rather than
 * a grid. Same rows as /shop — no second source of truth for what we sell.
 */
export interface MenuGroup {
	category: Category | null;
	products: Product[];
}

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { categories } = await parent();

	if (!isSupabaseConfigured()) return { groups: [] as MenuGroup[] };

	const products = await listProducts(locals.supabase, { sort: 'curated' }).catch((cause) => {
		console.error('[menu] product load failed:', cause);
		return [] as Product[];
	});

	const groups: MenuGroup[] = categories
		.map((category) => ({
			category,
			products: products.filter((product) => product.categoryId === category.id)
		}))
		.filter((group) => group.products.length > 0);

	// Anything whose category was deleted still belongs on the menu.
	const uncategorised = products.filter((product) => !product.categoryId);
	if (uncategorised.length > 0) groups.push({ category: null, products: uncategorised });

	return { groups };
};
