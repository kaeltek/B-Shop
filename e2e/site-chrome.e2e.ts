import { expect, test } from '@playwright/test';

/**
 * P1 smoke coverage for the layout shell. Replaces the `sv create` demo test
 * that was removed with the scaffold routes.
 *
 * The commerce-gate tests required by §3.5 arrive in P4.
 */

test('homepage renders header, heading and footer', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('banner')).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('skip link is the first keyboard stop and targets main', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');

	const skip = page.getByRole('link', { name: 'Skip to content' });
	await expect(skip).toBeFocused();
	await expect(skip).toHaveAttribute('href', '#main');
});

test('mobile drawer opens, and Escape closes it', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: 'Open menu' }).click();
	const drawer = page.getByRole('dialog', { name: 'Site menu' });
	await expect(drawer).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(drawer).toBeHidden();
});

test('the Shop nav item navigates without touching the dropdown', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');

	// The point of splitting the branch into a link and a toggle: /shop is
	// reachable in one click, with no submenu item in the way.
	const primary = page.getByRole('navigation', { name: 'Primary' });
	await primary.getByRole('link', { name: 'Shop', exact: true }).click();

	await expect(page).toHaveURL(/\/shop$/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the dropdown arrow toggles the submenu, and Escape closes it', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');

	const primary = page.getByRole('navigation', { name: 'Primary' });
	// Named for what it does, so the label link and the arrow never collide.
	const arrow = primary.getByRole('button', { name: /Shop categories$/ });

	await arrow.click();
	await expect(arrow).toHaveAttribute('aria-expanded', 'true');
	// Category names are admin-managed, so assert on the shape of the panel
	// rather than on whatever happens to be in the database today.
	await expect(primary.locator('.dropdown a').first()).toBeVisible();

	// A second click must close it — the old trigger swallowed this because
	// hover had already opened the menu before the click landed.
	await arrow.click();
	await expect(arrow).toHaveAttribute('aria-expanded', 'false');

	await arrow.click();
	await page.keyboard.press('Escape');
	await expect(arrow).toHaveAttribute('aria-expanded', 'false');
});

test('the drawer exposes both the Shop page and its categories', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: 'Open menu' }).click();
	const drawer = page.getByRole('dialog', { name: 'Site menu' });

	await drawer.getByRole('button', { name: /Shop categories$/ }).click();
	await expect(drawer.locator('.drawer-sub a').first()).toBeVisible();

	// The parent is still a link, so expanding it did not consume the tap.
	await drawer.getByRole('link', { name: 'Shop', exact: true }).click();
	await expect(page).toHaveURL(/\/shop$/);
});

test('footer exposes real tel: and mailto: links', async ({ page }) => {
	await page.goto('/');

	const footer = page.getByRole('contentinfo');
	await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1);
	await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
});
