import type { PageServerLoad } from './$types';
import { listProducts, listTags, type ProductSort } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import type { Product } from '$lib/types/catalogue';

const SORTS: ProductSort[] = ['curated', 'newest', 'price-asc', 'price-desc', 'name'];

function parseSort(value: string | null): ProductSort {
	return SORTS.includes(value as ProductSort) ? (value as ProductSort) : 'curated';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const category = url.searchParams.get('category') || undefined;
	const tag = url.searchParams.get('tag') || undefined;
	const sort = parseSort(url.searchParams.get('sort'));

	if (!isSupabaseConfigured()) {
		return { products: [] as Product[], tags: [] as string[], filters: { category, tag, sort } };
	}

	const supabase = locals.supabase;

	const [products, tags] = await Promise.all([
		listProducts(supabase, { categorySlug: category, tag, sort }),
		listTags(supabase).catch(() => [] as string[])
	]);

	return { products, tags, filters: { category, tag, sort } };
};
