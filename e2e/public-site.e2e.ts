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
	for (const path of ['/', '/shop', '/menu', '/about', '/gallery', '/contact']) {
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

test('newsletter rejects a submission without consent', async ({ page }) => {
	await page.goto('/');

	// Bypass the client-side `required` to prove the server enforces it too.
	await page.locator('#newsletter-email').fill('someone@example.com');
	await page.locator('form[action="/?/newsletter"] input[name="consent"]').evaluate((el) => {
		(el as HTMLInputElement).removeAttribute('required');
	});
	await page.getByRole('button', { name: 'Sign up' }).click();

	await expect(page.locator('#newsletter-status')).toContainText('consent');
});
