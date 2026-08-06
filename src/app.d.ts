// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { CommerceSettings } from '$lib/types/catalogue';

declare global {
	namespace App {
		interface Locals {
			/**
			 * Per-request Supabase client, scoped to the caller's cookies so RLS
			 * applies. Constructed lazily — accessing it while the project is
			 * unconfigured throws `SupabaseNotConfiguredError`.
			 */
			supabase: SupabaseClient<Database>;
			/** Verified session and user, or nulls. Validates the JWT server-side. */
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
			/**
			 * The commerce gate for this request, read at most once and shared
			 * between the hook, the guard and the layout load. Never cached
			 * across requests (§3.2).
			 */
			getCommerce(): Promise<CommerceSettings>;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
