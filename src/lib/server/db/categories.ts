import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '$lib/types/catalogue';
import type { CategoryRow } from './rows';

/** Category reads and writes. All Supabase access for categories lives here. */

const SELECT = 'id, slug, name, description, sort_order';

function toCategory(row: CategoryRow): Category {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		description: row.description,
		sortOrder: row.sort_order
	};
}

export async function listCategories(supabase: SupabaseClient): Promise<Category[]> {
	const { data, error } = await supabase
		.from('categories')
		.select(SELECT)
		.order('sort_order', { ascending: true })
		.order('name', { ascending: true })
		.returns<CategoryRow[]>();

	if (error) throw new Error(`Failed to list categories: ${error.message}`);
	return (data ?? []).map(toCategory);
}

export async function getCategoryBySlug(
	supabase: SupabaseClient,
	slug: string
): Promise<Category | null> {
	const { data, error } = await supabase
		.from('categories')
		.select(SELECT)
		.eq('slug', slug)
		.maybeSingle<CategoryRow>();

	if (error) throw new Error(`Failed to load category "${slug}": ${error.message}`);
	return data ? toCategory(data) : null;
}

export interface CategoryInput {
	slug: string;
	name: string;
	description?: string | null;
	sortOrder?: number;
}

export async function createCategory(
	supabase: SupabaseClient,
	input: CategoryInput
): Promise<Category> {
	const { data, error } = await supabase
		.from('categories')
		.insert({
			slug: input.slug,
			name: input.name,
			description: input.description ?? null,
			sort_order: input.sortOrder ?? 0
		})
		.select(SELECT)
		.single<CategoryRow>();

	if (error) throw new Error(`Failed to create category: ${error.message}`);
	return toCategory(data);
}

export async function updateCategory(
	supabase: SupabaseClient,
	id: string,
	input: Partial<CategoryInput>
): Promise<Category> {
	const payload: Record<string, unknown> = {};
	if (input.slug !== undefined) payload.slug = input.slug;
	if (input.name !== undefined) payload.name = input.name;
	if (input.description !== undefined) payload.description = input.description;
	if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;

	const { data, error } = await supabase
		.from('categories')
		.update(payload)
		.eq('id', id)
		.select(SELECT)
		.single<CategoryRow>();

	if (error) throw new Error(`Failed to update category: ${error.message}`);
	return toCategory(data);
}

/** Products in this category are not deleted — their category_id becomes null. */
export async function deleteCategory(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('categories').delete().eq('id', id);
	if (error) throw new Error(`Failed to delete category: ${error.message}`);
}
