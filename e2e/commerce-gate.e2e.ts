import { expect, test } from '@playwright/test';
import { canWrite, firstPublishedProductId, setCommerceEnabled } from './helpers/supabase';

/**
 * The four tests §3.5 requires.
 *
 * These mutate shared database state, which is why the suite runs with a
 * single worker — see the note in playwright.config.ts.
 *
 * Every test leaves the gate closed, which is both the seeded state and the
 * safe one.
 */

test.beforeAll(async () => {
	if (canWrite) await setCommerceEnabled(false);
});

test.afterAll(async () => {
	if (canWrite) await setCommerceEnabled(false);
});

test('§3.5.1 — POST /cart/add returns 403 with a valid product id', async ({ request }) => {
	const productId = await firstPublishedProductId();
	expect(productId, 'needs a seeded product to prove the id was not the problem').toBeTruthy();

	const response = await request.post('/cart/add', {
		data: { productId, quantity: 1 }
	});

	// 403, not 404: the caller asked to do something and is being refused.
	expect(response.status()).toBe(403);
});

test('§3.5.2 — GET /checkout returns 404', async ({ request }) => {
	const response = await request.get('/checkout');

	// 404 rather than 403 so a gated site does not advertise a hidden shop.
	expect(response.status()).toBe(404);
});

test('§3.5.3 — the product grid still renders every published product', async ({ page }) => {
	await page.goto('/shop');

	// 13 published in the seed; the 14th is a draft and must stay hidden.
	const cards = page.locator('article a[href^="/shop/"]');
	expect(await cards.count()).toBeGreaterThanOrEqual(13);

	await expect(page.getByRole('heading', { name: 'Sourdough Miche' })).toBeVisible();
	await expect(page.getByText('Winter Truffle Butter')).toHaveCount(0);

	// Gated, but not broken: a neutral affordance and no dead controls.
	await expect(page.getByRole('link', { name: 'View details' }).first()).toBeVisible();
	await expect(page.locator('button[disabled]')).toHaveCount(0);
});

test('§3.5.4 — toggling commerce flips the site on the next request', async ({ request, page }) => {
	test.skip(
		!canWrite,
		'Needs SUPABASE_SERVICE_ROLE_KEY in .env to write site_settings. Until P5 the suite has no admin session to toggle through the UI.'
	);

	// Closed: the routes are gone and the cart endpoint refuses.
	expect((await request.get('/checkout')).status()).toBe(404);
	expect((await request.get('/cart')).status()).toBe(404);

	await setCommerceEnabled(true);

	// Open on the very next request — no redeploy, no cache purge, no restart.
	// This is also what proves the 404s above were the gate and not a missing
	// route: the same URLs resolve now.
	expect((await request.get('/checkout')).status()).toBe(200);
	expect((await request.get('/cart')).status()).toBe(200);

	// And the cart endpoint is past the gate: 501 because P6 has not built it,
	// which is a different refusal from 403.
	const productId = await firstPublishedProductId();
	const add = await request.post('/cart/add', { data: { productId, quantity: 1 } });
	expect(add.status()).toBe(501);

	// The storefront switches too: the cart cluster returns to the header.
	await page.goto('/shop');
	await expect(page.getByRole('link', { name: /Cart, \d+ items/ })).toBeVisible();

	await setCommerceEnabled(false);

	// And back, just as immediately.
	expect((await request.get('/checkout')).status()).toBe(404);
	await page.goto('/shop');
	await expect(page.getByRole('link', { name: /Cart, \d+ items/ })).toHaveCount(0);
});

test('sitemap and robots follow the gate', async ({ request }) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();

	expect(sitemap).toContain('/shop/sourdough-miche');
	// Gated: commerce routes are absent so crawlers are not sent at 404s.
	expect(sitemap).not.toContain('<loc>http://localhost:4173/cart</loc>');
	expect(sitemap).not.toContain('<loc>http://localhost:4173/checkout</loc>');

	const robots = await (await request.get('/robots.txt')).text();
	expect(robots).toContain('Sitemap:');
	expect(robots).toContain('Disallow: /admin');
});

test('a gated product emits JSON-LD with no offers block', async ({ page }) => {
	await page.goto('/shop/sourdough-miche');

	const raw = await page.locator('script[type="application/ld+json"]').textContent();
	const parsed = JSON.parse(raw ?? '{}');

	expect(parsed['@type']).toBe('Product');
	// §3.4 — no price advertised for something that cannot be bought.
	expect(parsed.offers).toBeUndefined();
});
