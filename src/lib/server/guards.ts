import { error } from '@sveltejs/kit';
import type { CommerceSettings } from '$lib/types/catalogue';

/**
 * The commerce gate's lock (§3.3).
 *
 * The hook in `hooks.server.ts` is a net: it catches known commerce paths
 * before they reach a handler. This is the lock: it goes on the individual
 * form action or endpoint, so a route added later — under a path the hook's
 * list does not know about — still cannot take an order while the shop is
 * closed. Defence in depth, and the two are deliberately not the same
 * mechanism.
 *
 * Call it as the FIRST statement of every cart and checkout action and
 * endpoint, before reading the body, looking up a product, or touching a
 * session.
 */

export interface AssertOptions {
	/**
	 * How to refuse.
	 *
	 * `'api'` (default) answers 403: the caller asked to do something and is
	 * being told no. Right for form actions, endpoints, and anything that
	 * mutates.
	 *
	 * `'page'` answers 404, so a gated site does not advertise that a shop
	 * exists behind the curtain (§3.3).
	 */
	as?: 'api' | 'page';
}

/**
 * Throws unless commerce is enabled. Returns the settings when it is, so the
 * caller does not need a second read.
 */
export async function assertCommerceEnabled(
	locals: App.Locals,
	options: AssertOptions = {}
): Promise<CommerceSettings> {
	const commerce = await locals.getCommerce();

	if (commerce.enabled) return commerce;

	if (options.as === 'page') error(404, 'Not found');
	error(403, 'Commerce is currently disabled.');
}
