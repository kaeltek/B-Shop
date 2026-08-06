import { error, type Handle } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createRequestClient, isSupabaseConfigured } from '$lib/server/supabase';
import { GATED, getSettings } from '$lib/server/db/settings';
import type { CommerceSettings } from '$lib/types/catalogue';

/**
 * Paths that only exist when commerce is on (§3.3).
 *
 * Matching is prefix-based on a path segment boundary, so `/cart` covers
 * `/cart/add` but `/carts-of-history` is left alone.
 */
const COMMERCE_ROUTES = ['/cart', '/checkout', '/wishlist', '/api/cart', '/api/checkout'];

function isCommercePath(pathname: string): boolean {
	return COMMERCE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	let client: SupabaseClient | undefined;

	// Built lazily: constructing it eagerly would throw on every request while
	// Supabase is unconfigured, including on pages that never query.
	Object.defineProperty(event.locals, 'supabase', {
		configurable: true,
		enumerable: true,
		get() {
			client ??= createRequestClient(event.cookies);
			return client;
		}
	});

	/**
	 * Settings for this request, read at most once.
	 *
	 * Memoised per request rather than cached in module scope (§3.2): a stale
	 * gate after an admin toggles it is a correctness bug, but re-reading it
	 * three times in one request is just waste. The hook and the layout load
	 * share this promise.
	 */
	let commercePromise: Promise<CommerceSettings> | undefined;
	event.locals.getCommerce = () => {
		commercePromise ??= isSupabaseConfigured()
			? getSettings(event.locals.supabase)
			: Promise.resolve(GATED);
		return commercePromise;
	};

	/**
	 * Verified user, or nulls.
	 *
	 * `getSession()` alone is not trustworthy server-side: it decodes the cookie
	 * without verifying the signature, so a forged cookie would pass.
	 * `getUser()` validates against the auth server first.
	 */
	event.locals.safeGetSession = async () => {
		if (!isSupabaseConfigured()) return { session: null, user: null };

		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();

		if (userError || !user) return { session: null, user: null };

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	// ---------------------------------------------------------------------
	// The gate (§3.3)
	// ---------------------------------------------------------------------
	if (isCommercePath(event.url.pathname)) {
		const commerce = await event.locals.getCommerce();

		if (!commerce.enabled) {
			const isApi = event.url.pathname.startsWith('/api/');
			const isMutation = event.request.method !== 'GET' && event.request.method !== 'HEAD';

			// 403 for anything asking to *do* something — API calls and form
			// posts alike. §3.5 requires POST /cart/add to answer 403, and a
			// mutation deserves an explicit refusal rather than a pretence that
			// the endpoint was never there.
			if (isApi || isMutation) error(403, 'Commerce is currently disabled.');

			// 404 for page navigation, so gated mode does not advertise a hidden
			// shop to anyone probing URLs.
			error(404, 'Not found');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};
