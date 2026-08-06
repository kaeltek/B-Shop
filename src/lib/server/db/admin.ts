import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

/**
 * Admin identity.
 *
 * Asks the database rather than checking a claim in the JWT: `is_admin()` is
 * the same SECURITY DEFINER function every write policy uses, so the admin
 * console and RLS can never disagree about who is an admin. A user removed
 * from `admin_users` loses access on their next request, with no token to
 * expire first.
 */
export async function isAdmin(supabase: SupabaseClient<Database>): Promise<boolean> {
	const { data, error } = await supabase.rpc('is_admin');

	if (error) {
		// Fail closed. An unreachable database must not open the admin console.
		console.error('[db/admin] is_admin check failed:', error.message);
		return false;
	}

	return data === true;
}
