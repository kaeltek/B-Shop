import type { ProductInput } from '$lib/server/db/products';

/**
 * Parsing and validation for the admin product form.
 *
 * Shared by the create and edit actions so the two cannot drift — a rule
 * enforced on one path and not the other is the same as no rule.
 */

export interface ParsedProductForm {
	values: ProductInput;
	tags: string[];
	errors: Record<string, string>;
}

/** Lowercase, hyphenated, URL-safe. */
export function slugify(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/**
 * Reads a price as integer cents.
 *
 * Accepts "14", "14.5" and "14.50" and returns 1400 / 1450 / 1450. The
 * arithmetic goes through Math.round on a value already scaled by 100, so
 * "19.99" cannot land on 1998 the way `19.99 * 100` does in binary floating
 * point (§2.7).
 */
export function parsePriceToCents(raw: string): number | null {
	const trimmed = raw.trim().replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

	const [whole, fraction = ''] = trimmed.split('.');
	const cents = fraction.padEnd(2, '0');
	return Number(whole) * 100 + Number(cents);
}

export function parseProductForm(data: FormData): ParsedProductForm {
	const errors: Record<string, string> = {};

	const name = String(data.get('name') ?? '').trim();
	const slugRaw = String(data.get('slug') ?? '').trim();
	const priceRaw = String(data.get('price') ?? '').trim();
	const summary = String(data.get('summary') ?? '').trim();
	const description = String(data.get('description') ?? '').trim();
	const categoryId = String(data.get('categoryId') ?? '').trim();
	const currency = String(data.get('currency') ?? 'EUR')
		.trim()
		.toUpperCase();

	if (!name) errors.name = 'A name is required.';
	if (name.length > 200) errors.name = 'Keep the name under 200 characters.';

	const slug = slugify(slugRaw || name);
	if (!slug) errors.slug = 'Could not build a URL slug from that name.';

	const priceCents = parsePriceToCents(priceRaw || '0');
	if (priceCents === null) errors.price = 'Enter a price like 14 or 14.50.';

	if (!/^[A-Z]{3}$/.test(currency)) errors.currency = 'Currency must be a 3-letter code.';

	const tags = String(data.get('tags') ?? '')
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean);

	return {
		values: {
			name,
			slug,
			summary: summary || null,
			description: description || null,
			priceCents: priceCents ?? 0,
			currency,
			categoryId: categoryId || null,
			isPublished: data.get('isPublished') === 'on',
			isAvailable: data.get('isAvailable') === 'on',
			sortOrder: Number(data.get('sortOrder') ?? 0) || 0
		},
		tags: [...new Set(tags)],
		errors
	};
}

/**
 * Turns a Postgres unique-violation into a message about the field that
 * actually collided, rather than surfacing a constraint name to an editor.
 */
export function describeWriteError(cause: unknown): string {
	const message = cause instanceof Error ? cause.message : String(cause);
	if (message.includes('products_slug_key') || message.includes('duplicate key')) {
		return 'That URL slug is already in use by another product.';
	}
	return 'Could not save. Please try again.';
}
