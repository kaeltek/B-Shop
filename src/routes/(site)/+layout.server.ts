import type { LayoutServerLoad } from './$types';
import { GATED, getSettings } from '$lib/server/db/settings';
import { listCategories } from '$lib/server/db/categories';
import { isSupabaseConfigured } from '$lib/server/supabase';
import { site } from '$lib/content/site';
import type { Category } from '$lib/types/catalogue';
import type { NavLink } from '$lib/types/content';

/**
 * Settings and navigation data for the whole public site (§6, §3.2).
 *
 * Runs once per request. The settings row is deliberately not cached anywhere —
 * see the note in `db/settings.ts`.
 */

/** Merges admin-managed categories into the static nav's `/shop` entry. */
function buildNav(categories: Category[]): NavLink[] {
	if (categories.length === 0) return site.nav;

	return site.nav.map((item) =>
		item.href === '/shop'
			? {
					...item,
					children: categories.map((category) => ({
						label: category.name,
						href: `/shop?category=${category.slug}`
					}))
				}
			: item
	);
}

export const load: LayoutServerLoad = async ({ locals, depends, setHeaders }) => {
	// Lets the admin toggle call `invalidate('app:settings')` and refresh the
	// whole tree without a reload (§3.2).
	depends('app:settings');

	// Every page's content varies with the gate, so none of it may be cached by
	// a shared cache. Without this, Vercel's CDN could keep serving a
	// commerce-on page after the site has been switched to a catalogue (§3.2).
	setHeaders({ 'cache-control': 'private, no-store' });

	// Touching `locals.supabase` throws when the project is unconfigured, and
	// that read happens while evaluating the arguments below — outside any
	// try/catch inside those functions. Check first.
	if (!isSupabaseConfigured()) {
		return { commerce: GATED, categories: [], nav: site.nav };
	}

	const supabase = locals.supabase;

	const [commerce, categories] = await Promise.all([
		// Fails closed internally — never throws.
		getSettings(supabase),
		listCategories(supabase).catch((cause) => {
			// Navigation degrades to the static list rather than 500-ing the site.
			console.error('[layout] category load failed:', cause);
			return [] as Category[];
		})
	]);

	return { commerce, categories, nav: buildNav(categories) };
};
