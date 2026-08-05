import type { Handle } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createRequestClient, isSupabaseConfigured } from '$lib/server/supabase';

/**
 * Attaches a per-request Supabase client and a session helper to `locals`.
 *
 * The client is built lazily. Constructing it eagerly would throw on every
 * request while the project is still unconfigured — including requests to pages
 * that never touch the database. Deferring construction to first access keeps
 * those pages working and puts the error where the cause actually is.
 *
 * The commerce-gate route guard (§3.3) lands here in P4.
 */
export const handle: Handle = async ({ event, resolve }) => {
	let client: SupabaseClient | undefined;

	Object.defineProperty(event.locals, 'supabase', {
		configurable: true,
		enumerable: true,
		get() {
			client ??= createRequestClient(event.cookies);
			return client;
		}
	});

	/**
	 * Returns a verified user, or nulls.
	 *
	 * `getSession()` alone is not trustworthy on the server: it decodes the
	 * cookie without checking the signature, so a forged cookie would pass.
	 * `getUser()` validates against the auth server, and the session is only
	 * returned once that has succeeded.
	 */
	event.locals.safeGetSession = async () => {
		if (!isSupabaseConfigured()) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) return { session: null, user: null };

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	return resolve(event, {
		// Supabase sets these on some responses; SvelteKit strips unknown headers
		// from serialised load responses unless they are allow-listed.
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};
