import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProductBySlug, listProducts } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import { priceForSchema } from '$lib/utils/money';
import { mediaUrl } from '$lib/utils/media';
import type { CommerceSettings, Product } from '$lib/types/catalogue';
import { primaryImage } from '$lib/types/catalogue';

/**
 * Builds the schema.org JSON-LD tag.
 *
 * Assembled here rather than in the component because a `<script>` tag in
 * Svelte markup is awkward for both the compiler and the ESLint parser, and
 * because the escaping below is easier to review next to the serialisation.
 *
 * §3.4: gated products emit `Product` with NO `offers` block. Advertising a
 * price for something that cannot be bought would put the shop into search and
 * Shopping results while it is closed.
 */
function buildJsonLd(product: Product, commerce: CommerceSettings, origin: string): string {
	const hero = primaryImage(product);

	const payload = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.summary ?? product.description ?? undefined,
		sku: product.id,
		url: `${origin}/shop/${product.slug}`,
		image: hero ? `${origin}${mediaUrl(hero.storageKey)}` : undefined,
		...(commerce.enabled
			? {
					offers: {
						'@type': 'Offer',
						price: priceForSchema(product.priceCents),
						priceCurrency: product.currency,
						availability: product.isAvailable
							? 'https://schema.org/InStock'
							: 'https://schema.org/OutOfStock',
						url: `${origin}/shop/${product.slug}`
					}
				}
			: {})
	};

	// JSON.stringify does not escape `<`, so a product description containing
	// `</script>` would close this tag early and everything after it would be
	// parsed as HTML — script injection through the product name field. The
	// escape is invisible to a JSON parser and neutralises the sequence.
	const json = JSON.stringify(payload).replace(/</g, '\\u003c');

	return `<script type="application/ld+json">${json}</script>`;
}

export const load: PageServerLoad = async ({ locals, params, url, parent }) => {
	if (!isSupabaseConfigured()) error(404, 'Not found');

	const supabase = locals.supabase;
	const product = await getProductBySlug(supabase, params.slug);

	// An unpublished product is invisible to the anon client thanks to RLS, so
	// this 404s for the public and resolves for an admin — without this route
	// needing to know the difference.
	if (!product) error(404, 'We could not find that product');

	const { commerce } = await parent();

	const related = await listProducts(supabase, { sort: 'curated', limit: 4 })
		.then((all) => all.filter((item) => item.id !== product.id).slice(0, 3))
		.catch(() => [] as Product[]);

	return {
		product,
		related,
		jsonLdTag: buildJsonLd(product, commerce, url.origin)
	};
};
