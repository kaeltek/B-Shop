import { expect, test } from '@playwright/test';

/**
 * Admin access control and the media endpoint.
 *
 * These run anonymously. Signed-in coverage needs an account in the linked
 * project plus a row in `admin_users`, which is a credential decision for the
 * project owner — see the note at the end of the P5 summary.
 *
 * What is covered here is the part that matters most anyway: that none of it
 * is reachable without signing in.
 */

const ADMIN_ROUTES = [
	'/admin',
	'/admin/products',
	'/admin/products/new',
	'/admin/categories',
	'/admin/settings'
];

test('every admin route redirects an anonymous visitor to sign in', async ({ page }) => {
	for (const route of ADMIN_ROUTES) {
		await page.goto(route);
		await expect(page, `${route} should redirect`).toHaveURL(/\/login\?redirectTo=/);
	}
});

test('the login page renders and preserves the intended destination', async ({ page }) => {
	await page.goto('/admin/settings');

	await expect(page).toHaveURL(/redirectTo=%2Fadmin%2Fsettings/);
	await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
	await expect(page.locator('input[name="redirectTo"]')).toHaveValue('/admin/settings');
});

test('bad credentials give one generic message, never account enumeration', async ({ page }) => {
	await page.goto('/login');

	await page.locator('#email').fill('definitely-not-a-user@example.com');
	await page.locator('#password').fill('wrong-password');
	await page.getByRole('button', { name: 'Sign in' }).click();

	const alert = page.getByRole('alert');
	await expect(alert).toBeVisible();
	// Must not distinguish "no such account" from "wrong password".
	await expect(alert).toContainText('did not match');
});

test('logout is not reachable by GET', async ({ request }) => {
	// A GET logout could be triggered by an <img> tag or a link prefetcher.
	const response = await request.get('/logout', { maxRedirects: 0 });
	expect([404, 405]).toContain(response.status());
});

test('media rejects path traversal and 404s unknown keys', async ({ request }) => {
	// Encoded so the client does not normalise it away before it arrives.
	const traversal = await request.get('/media/..%2F..%2Fpackage.json');
	expect(traversal.status(), 'traversal must not resolve').toBe(400);

	const missing = await request.get('/media/products/does-not-exist/nope-1600.webp');
	expect(missing.status()).toBe(404);
});

test('robots keeps crawlers out of the admin', async ({ request }) => {
	const robots = await (await request.get('/robots.txt')).text();
	expect(robots).toContain('Disallow: /admin');
	expect(robots).toContain('Disallow: /login');
});
