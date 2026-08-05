import type { SupabaseClient } from '@supabase/supabase-js';
import type { CommerceSettings } from '$lib/types/catalogue';
import type { SiteSettingsRow } from './rows';

/**
 * Site settings — the commerce gate (§3.2).
 *
 * There is deliberately NO module-scope cache here. One indexed single-row
 * lookup per request is cheap; serving a stale gate after an admin has flipped
 * it is a correctness bug, and the failure mode is a shop that still takes
 * money after being switched off.
 */

const SELECT = 'commerce_enabled, show_prices_when_gated, gated_notice';

/** Fails closed: any error yields a gated site rather than an open till. */
const GATED: CommerceSettings = { enabled: false, showPrices: false, notice: null };

function toCommerceSettings(row: SiteSettingsRow): CommerceSettings {
	return {
		enabled: row.commerce_enabled,
		showPrices: row.show_prices_when_gated,
		notice: row.gated_notice
	};
}

/**
 * Reads the singleton settings row.
 *
 * On any failure — unreachable database, missing row, unconfigured project —
 * this returns the gated defaults instead of throwing. A storefront that loses
 * its database should degrade into a catalogue, not a 500, and certainly not
 * into an open checkout.
 */
export async function getSettings(supabase: SupabaseClient): Promise<CommerceSettings> {
	try {
		const { data, error } = await supabase
			.from('site_settings')
			.select(SELECT)
			.eq('id', true)
			.single<SiteSettingsRow>();

		if (error || !data) {
			console.error('[db/settings] falling back to gated:', error?.message ?? 'no row');
			return GATED;
		}

		return toCommerceSettings(data);
	} catch (cause) {
		console.error('[db/settings] falling back to gated:', cause);
		return GATED;
	}
}

export interface SettingsUpdate {
	commerceEnabled?: boolean;
	showPricesWhenGated?: boolean;
	gatedNotice?: string | null;
}

/**
 * Updates the singleton. Admin-only, enforced by RLS rather than by this
 * function — a non-admin's update matches zero rows.
 *
 * `updated_at` / `updated_by` are stamped by the database trigger, and the
 * audit rows are written there too, so callers cannot forge either.
 */
export async function updateSettings(
	supabase: SupabaseClient,
	patch: SettingsUpdate
): Promise<CommerceSettings> {
	const payload: Record<string, unknown> = {};
	if (patch.commerceEnabled !== undefined) payload.commerce_enabled = patch.commerceEnabled;
	if (patch.showPricesWhenGated !== undefined)
		payload.show_prices_when_gated = patch.showPricesWhenGated;
	if (patch.gatedNotice !== undefined) payload.gated_notice = patch.gatedNotice;

	if (Object.keys(payload).length === 0) return getSettings(supabase);

	const { data, error } = await supabase
		.from('site_settings')
		.update(payload)
		.eq('id', true)
		.select(SELECT)
		.single<SiteSettingsRow>();

	if (error) throw new Error(`Failed to update site settings: ${error.message}`);
	if (!data) throw new Error('Failed to update site settings: not permitted');

	return toCommerceSettings(data);
}
