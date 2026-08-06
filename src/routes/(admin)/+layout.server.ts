import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isAdmin } from '$lib/server/db/admin';
import { isSupabaseConfigured } from '$lib/server/supabase';

/**
 * Admin guard (§6).
 *
 * Two separate questions, in order: are you signed in, and are you an admin.
 * They get different answers — an anonymous visitor is sent to sign in, a
 * signed-in non-admin is refused — because redirecting the second to a login
 * page they are already past is a loop.
 *
 * This is the console's lock, not the data's. Every table's RLS policy
 * independently requires `is_admin()`, so a bug here cannot expose or alter a
 * row: it could only render a page that then fails every query.
 */
export const load: LayoutServerLoad = async ({ locals, url, setHeaders }) => {
	// Nothing behind this guard may sit in any cache, shared or private.
	setHeaders({ 'cache-control': 'no-store' });

	if (!isSupabaseConfigured()) {
		error(503, 'Supabase is not configured on this deployment.');
	}

	const { user } = await locals.safeGetSession();

	if (!user) {
		redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	if (!(await isAdmin(locals.supabase))) {
		error(
			403,
			'This account does not have admin access. Ask an existing admin to add you to admin_users.'
		);
	}

	return {
		user: { id: user.id, email: user.email ?? '' }
	};
};
