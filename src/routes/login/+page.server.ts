import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isSupabaseConfigured } from '$lib/server/supabase';
import { addressPrefix, rateLimit } from '$lib/server/rateLimit';

/**
 * Admin sign-in.
 *
 * Email and password against Supabase Auth. There is deliberately no sign-up
 * path: accounts are created in the Supabase dashboard and granted access by
 * being added to `admin_users`.
 */

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

/** Only same-origin paths, so `?redirectTo=https://evil.example` cannot work. */
function safeRedirect(target: string | null): string {
	if (!target || !target.startsWith('/') || target.startsWith('//')) return '/admin';
	return target;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));

	return { configured: isSupabaseConfigured() };
};

export const actions: Actions = {
	default: async ({ request, locals, url, getClientAddress }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const redirectTo = safeRedirect(String(data.get('redirectTo') ?? ''));

		if (!email || !password) {
			return fail(400, { message: 'Enter your email address and password.', email });
		}

		// Rate limited by source, not by account: limiting per account lets an
		// attacker lock a known admin out by failing their login on purpose.
		const limit = rateLimit(
			`login:${addressPrefix(getClientAddress())}`,
			LOGIN_LIMIT,
			LOGIN_WINDOW_MS
		);
		if (!limit.allowed) {
			return fail(429, {
				message: 'Too many sign-in attempts. Try again in a few minutes.',
				email
			});
		}

		if (!isSupabaseConfigured()) {
			return fail(503, { message: 'Authentication is not configured on this deployment.', email });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			// One message for every failure. Distinguishing "no such account"
			// from "wrong password" turns the form into an account enumerator.
			console.warn('[login] failed attempt:', error.message);
			return fail(400, { message: 'Those details did not match an account.', email });
		}

		redirect(303, redirectTo || url.searchParams.get('redirectTo') || '/admin');
	}
};
