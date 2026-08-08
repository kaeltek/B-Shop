import { expect, test, type Page } from '@playwright/test';

/**
 * The shop's products have to be *painted*, not merely rendered.
 *
 * The scroll reveal in `$lib/actions/reveal` starts every tile at `opacity: 0`
 * and un-hides it when its group enters the viewport. Twice that mechanism has
 * left a correctly server-rendered catalogue invisible:
 *
 *   1. The observer used `threshold: 0.05`. `intersectionRatio` is measured
 *      against the observed element's own size, and the shop grid runs several
 *      viewports tall, so it could never reach 5% — on a 1440x900 desktop the
 *      whole catalogue sat at opacity 0 until the reader scrolled far enough,
 *      and on a phone further still.
 *   2. The reveal attribute was written to each child. Filtering by category
 *      replaces every child, and the replacements arrived without it.
 *
 * Both bugs render identically to `expect(...).toBeVisible()` on the markup, so
 * these assert what a reader would actually see: nothing inside the viewport
 * may be transparent. Deliberately free of any product name or category slug —
 * this has to keep working after the catalogue is replaced.
 */

/** Product tiles whose box overlaps the viewport but which paint as nothing. */
async function invisibleTilesInView(page: Page): Promise<number> {
	return page.evaluate(
		() =>
			Array.from(document.querySelectorAll('.grid article')).filter((tile) => {
				const box = tile.getBoundingClientRect();
				const onScreen = box.bottom > 0 && box.top < window.innerHeight && box.width > 0;
				// `opacityProperty` walks ancestors, which is where the reveal lives.
				return onScreen && !tile.checkVisibility({ opacityProperty: true });
			}).length
	);
}

async function tileCount(page: Page): Promise<number> {
	return page.locator('.grid article').count();
}

/**
 * Polls rather than sampling once. A tile mid-fade is momentarily transparent
 * and that is the feature working; a tile that is still transparent seconds
 * later is the bug. Nothing here scrolls, so the reveal gets no help.
 */
async function expectNothingStaysHidden(page: Page, because = 'tiles in view stayed hidden') {
	await expect.poll(() => invisibleTilesInView(page), { message: because, timeout: 5000 }).toBe(0);
}

const VIEWPORTS = [
	{ name: 'mobile', width: 390, height: 844 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'desktop', width: 1440, height: 900 }
];

for (const viewport of VIEWPORTS) {
	test(`${viewport.name}: products paint on load, with no scroll and no refresh`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/shop');

		expect(await tileCount(page), 'the catalogue should not be empty').toBeGreaterThan(0);
		await expectNothingStaysHidden(page);
	});

	test(`${viewport.name}: the whole catalogue paints once scrolled through`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await page.goto('/shop');

		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.75) {
				window.scrollTo(0, y);
				await new Promise((resolve) => setTimeout(resolve, 150));
			}
		});
		// The stagger runs 60ms per tile on top of a 500ms fade.
		await page.waitForTimeout(2000);

		const transparent = await page.evaluate(
			() =>
				Array.from(document.querySelectorAll('.grid article')).filter(
					(tile) => !tile.checkVisibility({ opacityProperty: true })
				).length
		);
		expect(transparent).toBe(0);
	});

	test(`${viewport.name}: switching category paints the new products`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await page.goto('/shop');

		const categories = page.locator('nav[aria-label="Filter by category"] a');
		const total = await categories.count();
		expect(total, 'the category nav should reach mobile too').toBeGreaterThan(1);

		// Every category in turn, then back to All: the bug only showed up on the
		// second and later swaps, once a previous set had already been revealed.
		for (let i = 1; i < total; i++) {
			await categories.nth(i).click();
			await page.waitForURL(/\/shop\?category=/);
			await expect(categories.nth(i)).toHaveAttribute('aria-current', 'page');

			if ((await tileCount(page)) > 0) {
				await page.locator('.grid article').first().scrollIntoViewIfNeeded();
				await expectNothingStaysHidden(page, `category ${i} left its tiles hidden`);
			}
		}

		await categories.first().click();
		await page.waitForURL(/\/shop$/);
		await page.locator('.grid article').first().scrollIntoViewIfNeeded();
		await expectNothingStaysHidden(page, 'returning to All left its tiles hidden');
	});
}

test('returning to the shop from another page paints without a refresh', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');

	await page.locator('.header-nav a[href="/shop"]').click();
	await page.waitForURL(/\/shop$/);

	expect(await tileCount(page)).toBeGreaterThan(0);
	await expectNothingStaysHidden(page, 'a client-side navigation left the shop blank');
});
