import { expect, test } from '@playwright/test';

/**
 * P3 coverage for the public site.
 *
 * These assume the seed data is present in the linked Supabase project.
 * The commerce-gate tests required by §3.5 arrive in P4 — what is asserted
 * here is only that the catalogue itself is correct and that unpublished
 * products stay invisible.
 */

test('every public route responds', async ({ page }) => {
	for (const path of ['/', '/shop', '/gallery', '/contact']) {
		const response = await page.goto(path);
		expect(response?.status(), `${path} should be 200`).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
});

test('shop lists published products and links to detail pages', async ({ page }) => {
	await page.goto('/shop');

	const cards = page.locator('a[href^="/shop/"]');
	expect(await cards.count()).toBeGreaterThan(0);

	await expect(page.getByRole('heading', { name: 'Sourdough Miche' })).toBeVisible();
});

test('an unpublished product is absent from the shop and 404s directly', async ({ page }) => {
	await page.goto('/shop');
	await expect(page.getByText('Winter Truffle Butter')).toHaveCount(0);

	const response = await page.goto('/shop/winter-truffle-butter');
	expect(response?.status()).toBe(404);
});

test('category filter narrows the grid and is shareable', async ({ page }) => {
	await page.goto('/shop?category=bakery');

	await expect(page.getByRole('link', { name: 'Bakery', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(page.getByRole('heading', { name: 'Sourdough Miche' })).toBeVisible();
	// Coffee lives in another category and must have been filtered out.
	await expect(page.getByRole('heading', { name: 'House Espresso Blend' })).toHaveCount(0);
});

test('product detail renders and emits JSON-LD', async ({ page }) => {
	await page.goto('/shop/sourdough-miche');

	await expect(page.getByRole('heading', { level: 1, name: 'Sourdough Miche' })).toBeVisible();

	const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
	const parsed = JSON.parse(jsonLd ?? '{}');
	expect(parsed['@type']).toBe('Product');
	expect(parsed.name).toBe('Sourdough Miche');
});

test('gated mode shows a neutral affordance, never a disabled button', async ({ page }) => {
	// The seeded settings row has commerce_enabled = false, so the storefront is
	// a catalogue. §1: no disabled buttons, no "unavailable" stubs.
	await page.goto('/shop');

	await expect(page.getByRole('link', { name: 'View details' }).first()).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
	await expect(page.locator('button[disabled]')).toHaveCount(0);
});

test('the gallery renders real photography, not placeholder artwork', async ({ page }) => {
	await page.goto('/gallery');

	const tiles = page.locator('[data-gallery-grid] img');
	await expect(tiles).toHaveCount(19);

	// Scroll the lazy tiles into view so every one of them actually fetches.
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.waitForLoadState('networkidle');

	// A broken path still yields an <img>; it decodes to naturalWidth 0.
	const widths = await tiles.evaluateAll((images) =>
		images.map((image) => (image as HTMLImageElement).naturalWidth)
	);
	expect(widths.filter((width) => width === 0)).toEqual([]);
});

test('the homepage gallery shows the same images and opens the lightbox', async ({ page }) => {
	await page.goto('/');

	const tiles = page.locator('[data-gallery-grid] img');
	await expect(tiles).toHaveCount(8);
	await expect(tiles.first()).toHaveAttribute('src', /^\/gallery\//);

	await tiles.first().click();
	const lightbox = page.getByRole('dialog');
	await expect(lightbox).toBeVisible();

	// Arrow keys move, Escape closes (§8.9, §10).
	await page.keyboard.press('ArrowRight');
	await expect(lightbox).toContainText('2 / 8');
	await page.keyboard.press('Escape');
	await expect(lightbox).toHaveCount(0);
});
