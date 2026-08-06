import type { RequestHandler } from './$types';

/**
 * robots.txt.
 *
 * A route rather than a file in static/, because the disallow list depends on
 * the commerce gate and a static file cannot know about it. (The scaffold's
 * static/robots.txt was removed — it would have shadowed this.)
 */
export const GET: RequestHandler = async ({ locals, url, setHeaders }) => {
	const commerce = await locals.getCommerce();

	const lines = ['User-agent: *', 'Allow: /'];

	// Transactional pages are never worth indexing. While gated they do not
	// resolve at all, so there is nothing to say about them.
	if (commerce.enabled) {
		lines.push('Disallow: /cart', 'Disallow: /checkout');
	}

	// Never indexable, in either mode.
	lines.push('Disallow: /admin', 'Disallow: /login', '', `Sitemap: ${url.origin}/sitemap.xml`);

	setHeaders({
		'content-type': 'text/plain',
		'cache-control': 'private, no-store'
	});

	return new Response(`${lines.join('\n')}\n`);
};
