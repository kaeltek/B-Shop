import type { PageServerLoad } from './$types';
import { assertCommerceEnabled } from '$lib/server/guards';

/**
 * Checkout.
 *
 * §3.5: with commerce disabled, `GET /checkout` must return 404. The shell
 * exists so that 404 is the gate refusing a real route rather than the router
 * failing to find one. Payment goes behind its own interface in P6 — no real
 * provider is wired without asking first (§9).
 */
export const load: PageServerLoad = async ({ locals }) => {
	await assertCommerceEnabled(locals, { as: 'page' });

	return { items: [], totalCents: 0 };
};
