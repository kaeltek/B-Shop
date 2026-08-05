// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			/**
			 * Per-request Supabase client, scoped to the caller's cookies so RLS
			 * applies. Constructed lazily — accessing it while the project is
			 * unconfigured throws `SupabaseNotConfiguredError`.
			 */
			supabase: SupabaseClient;
			/** Verified session and user, or nulls. Validates the JWT server-side. */
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
