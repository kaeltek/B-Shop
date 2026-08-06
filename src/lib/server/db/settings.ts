import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { CommerceSettings } from '$lib/types/catalogue';
import type { SiteSettingsRow, SiteSettingsUpdate } from './rows';

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
export const GATED: CommerceSettings = { enabled: false, showPrices: false, notice: null };

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
export async function getSettings(supabase: SupabaseClient<Database>): Promise<CommerceSettings> {
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
	supabase: SupabaseClient<Database>,
	patch: SettingsUpdate
): Promise<CommerceSettings> {
	const payload: SiteSettingsUpdate = {};
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

export interface AuditEntry {
	id: number;
	changedAt: string;
	field: string;
	oldValue: string | null;
	newValue: string | null;
}

/**
 * Recent changes to the gate.
 *
 * Written by the database trigger, so this shows edits made in the Supabase
 * dashboard or over psql as well as ones made through this console.
 * Admin-readable only, enforced by RLS.
 */
export async function listSettingsAudit(
	supabase: SupabaseClient<Database>,
	limit = 10
): Promise<AuditEntry[]> {
	const { data, error } = await supabase
		.from('site_settings_audit')
		.select('id, changed_at, field, old_value, new_value')
		.order('changed_at', { ascending: false })
		.limit(limit);

	if (error) {
		console.error('[db/settings] audit read failed:', error.message);
		return [];
	}

	return (data ?? []).map((row) => ({
		id: row.id,
		changedAt: row.changed_at,
		field: row.field,
		oldValue: row.old_value,
		newValue: row.new_value
	}));
}
