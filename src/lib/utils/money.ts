/**
 * Money formatting.
 *
 * Input is always integer minor units (§2.7). Nothing here ever accepts or
 * produces a float — dividing by 100 happens once, at the very last step,
 * inside Intl, and the result is a string for display only.
 */

/**
 * Formats integer cents as a localised currency string.
 *
 * @param cents    Integer minor units, e.g. 1400
 * @param currency ISO 4217 code, e.g. 'EUR'
 * @param locale   Defaults to 'en-IE' to match the shop's Eurozone base.
 */
export function formatPrice(cents: number, currency: string, locale = 'en-IE'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		// Whole amounts read better without trailing zeros on a menu, but part
		// amounts must keep both digits — €7 and €7.50, never €7.5.
		minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
		maximumFractionDigits: 2
	}).format(cents / 100);
}

/** Machine-readable amount for schema.org / JSON-LD, e.g. "14.00". */
export function priceForSchema(cents: number): string {
	return (cents / 100).toFixed(2);
}
