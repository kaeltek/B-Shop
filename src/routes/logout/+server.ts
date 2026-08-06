import { redirect, type RequestHandler } from '@sveltejs/kit';

/**
 * POST /logout
 *
 * POST rather than GET on purpose: a GET would let any page log an admin out
 * with an `<img src="/logout">`, and would be followed by link prefetchers.
 */
export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut();
	redirect(303, '/login');
};
