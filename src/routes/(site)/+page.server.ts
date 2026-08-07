import type { PageServerLoad } from './$types';
import { listFeaturedProducts } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import type { Product } from '$lib/types/catalogue';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isSupabaseConfigured()) return { featured: [] as Product[] };

	const featured = await listFeaturedProducts(locals.supabase, 3).catch((cause) => {
		console.error('[home] featured products failed:', cause);
		return [] as Product[];
	});

	return { featured };
};
