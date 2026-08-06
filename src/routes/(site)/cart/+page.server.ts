import type { PageServerLoad } from './$types';
import { assertCommerceEnabled } from '$lib/server/guards';

/**
 * Cart page.
 *
 * The shell exists at P4 so the gate has a real route to close. Without it a
 * 404 from `/cart` would only prove that nothing is mounted there, which is
 * not the same thing as proving the gate works. Cart state and line items
 * arrive in P6.
 */
export const load: PageServerLoad = async ({ locals }) => {
	// First statement, before anything else touches the request (§3.3).
	await assertCommerceEnabled(locals, { as: 'page' });

	return { items: [] };
};
