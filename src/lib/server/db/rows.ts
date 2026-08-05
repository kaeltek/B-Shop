/**
 * TEMPORARY row shapes.
 *
 * §2.4 says row types come from the Supabase CLI, not from a keyboard. That
 * generator needs a project to introspect and there is not one yet, so these
 * stand in until there is.
 *
 * **To remove this file**, once a project is linked:
 *
 *   npx supabase link --project-ref <ref>
 *   npm run db:types            # writes src/lib/types/database.ts
 *
 * then replace each import of `./rows` with the generated equivalent
 *
 *   type ProductRow = Database['public']['Tables']['products']['Row'];
 *
 * and type the client as `SupabaseClient<Database>` in supabase.ts. Nothing
 * outside `src/lib/server/db/` imports these, so it is a contained change.
 *
 * Keep this file in sync with supabase/migrations/ by hand until then.
 */

export interface CategoryRow {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	sort_order: number;
}

export interface ProductImageRow {
	id: string;
	product_id: string;
	storage_key: string;
	alt_text: string;
	width: number;
	height: number;
	sort_order: number;
	is_primary: boolean;
}

export interface ProductRow {
	id: string;
	slug: string;
	name: string;
	summary: string | null;
	description: string | null;
	price_cents: number;
	currency: string;
	category_id: string | null;
	is_published: boolean;
	is_available: boolean;
	sort_order: number;
	/** Embedded by PostgREST when the select asks for them. */
	product_tags?: { tag: string }[] | null;
	product_images?: ProductImageRow[] | null;
}

export interface SiteSettingsRow {
	commerce_enabled: boolean;
	show_prices_when_gated: boolean;
	gated_notice: string | null;
}
