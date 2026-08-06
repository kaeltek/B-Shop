import type { PageServerLoad } from './$types';
import { listProducts } from '$lib/server/db/products';
import { listCategories } from '$lib/server/db/categories';
import { activeStoreName } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals }) => {
	// Admins see drafts through the same query as everyone else — the RLS policy
	// widens for them rather than the code branching.
	const [products, categories, commerce] = await Promise.all([
		listProducts(locals.supabase, { sort: 'curated' }),
		listCategories(locals.supabase),
		locals.getCommerce()
	]);

	const published = products.filter((product) => product.isPublished);

	return {
		commerce,
		imageStore: activeStoreName(),
		stats: {
			total: products.length,
			published: published.length,
			drafts: products.length - published.length,
			outOfStock: published.filter((product) => !product.isAvailable).length,
			categories: categories.length,
			missingAltText: products.filter((product) =>
				product.images.some((image) => image.altText.trim() === '')
			).length
		}
	};
};
