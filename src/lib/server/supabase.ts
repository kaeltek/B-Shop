import { createServerClient } from '@supabase/ssr';
import type { Database } from '$lib/types/database';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

/**
 * Supabase client construction. Nothing outside `src/lib/server/` may import
 * this — see §2.1 and ARCHITECTURE.md.
 *
 * `$env/dynamic/*` rather than `$env/static/*` on purpose: static env is
 * inlined at build time and a missing variable is a build failure. Reading
 * dynamically means an unconfigured project fails at the point of use, with a
 * message that says what to do, instead of breaking `npm run build`.
 */

export class SupabaseNotConfiguredError extends Error {
	constructor(missing: string[]) {
		super(
			`Supabase is not configured. Missing environment ${
				missing.length === 1 ? 'variable' : 'variables'
			}: ${missing.join(', ')}. ` +
				'Fill them in .env from your project at Project Settings → API, ' +
				'then restart the dev server.'
		);
		this.name = 'SupabaseNotConfiguredError';
	}
}

function readPublicConfig(): { url: string; anonKey: string } {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	const anonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY;

	const missing: string[] = [];
	if (!url) missing.push('PUBLIC_SUPABASE_URL');
	if (!anonKey) missing.push('PUBLIC_SUPABASE_ANON_KEY');
	if (missing.length > 0) throw new SupabaseNotConfiguredError(missing);

	return { url: url!, anonKey: anonKey! };
}

/** True when the anon-key client can be constructed. */
export function isSupabaseConfigured(): boolean {
	return Boolean(publicEnv.PUBLIC_SUPABASE_URL && publicEnv.PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Per-request client carrying the caller's cookies, so every query runs as that
 * user and RLS applies. This is the default client for all reads.
 */
export function createRequestClient(cookies: Cookies): SupabaseClient<Database> {
	const { url, anonKey } = readPublicConfig();

	return createServerClient(url, anonKey, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					// SvelteKit requires an explicit path; Supabase does not always
					// supply one.
					cookies.set(name, value, { ...options, path: options?.path ?? '/' });
				}
			}
		}
	});
}

/**
 * Service-role client. **Bypasses row level security entirely.**
 *
 * Only for work that legitimately has no user context: deleting storage objects
 * after a product is removed, and background jobs. Never construct this in
 * response to unvalidated user input, and never expose its results without
 * doing your own authorisation check first — RLS is not there to help you here.
 */
export function createServiceClient(): SupabaseClient<Database> {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	const serviceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

	const missing: string[] = [];
	if (!url) missing.push('PUBLIC_SUPABASE_URL');
	if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
	if (missing.length > 0) throw new SupabaseNotConfiguredError(missing);

	return createClient(url!, serviceKey!, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
}
