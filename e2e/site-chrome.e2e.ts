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

test('desktop dropdown opens on click and closes on Escape', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');

	// Scoped to the primary nav: "Our Story" also appears in the footer.
	const primary = page.getByRole('navigation', { name: 'Primary' });
	const trigger = primary.getByRole('button', { name: 'About' });

	await trigger.click();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await expect(primary.getByRole('link', { name: 'Our Story' })).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('footer exposes real tel: and mailto: links', async ({ page }) => {
	await page.goto('/');

	const footer = page.getByRole('contentinfo');
	await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1);
	await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
});
