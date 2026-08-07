import type { RequestHandler } from './$types';
import { listProducts } from '$lib/server/db/products';
import { isSupabaseConfigured } from '$lib/server/supabase';
import type { Product } from '$lib/types/catalogue';

/**
 * sitemap.xml, gate-aware (§3.4).
 *
 * Commerce routes are listed only while commerce is on. Publishing /cart and
 * /checkout while the site is a catalogue would invite crawlers to URLs that
 * deliberately answer 404, and would leave them in the index after the shop
 * closes.
 *
 * Products are always listed: gated mode is a catalogue, and a catalogue is
 * exactly the thing you want indexed.
 */

const STATIC_PATHS = ['/', '/shop', '/gallery', '/contact'];
const COMMERCE_PATHS = ['/cart', '/checkout'];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function urlEntry(origin: string, path: string, priority: string, lastmod?: string): string {
	return [
		'	<url>',
		`		<loc>${escapeXml(origin + path)}</loc>`,
		lastmod ? `		<lastmod>${lastmod}</lastmod>` : '',
		`		<priority>${priority}</priority>`,
		'	</url>'
	]
		.filter(Boolean)
		.join('\n');
}

export const GET: RequestHandler = async ({ locals, url, setHeaders }) => {
	const commerce = await locals.getCommerce();
	const origin = url.origin;

	let products: Product[] = [];
	if (isSupabaseConfigured()) {
		products = await listProducts(locals.supabase, { sort: 'curated' }).catch((cause) => {
			// A sitemap missing its products is far better than a 500: crawlers
			// treat a hard error as a signal about the whole site.
			console.error('[sitemap] product load failed:', cause);
			return [];
		});
	}

	const paths = [...STATIC_PATHS, ...(commerce.enabled ? COMMERCE_PATHS : [])];

	const entries = [
		...paths.map((path) => urlEntry(origin, path, path === '/' ? '1.0' : '0.8')),
		...products.map((product) => urlEntry(origin, `/shop/${product.slug}`, '0.6'))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	setHeaders({
		'content-type': 'application/xml',
		// Varies with the gate, so it must not sit in a shared cache (§3.2).
		'cache-control': 'private, no-store'
	});

	return new Response(xml);
};
