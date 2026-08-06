import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createCategory,
	deleteCategory,
	listCategories,
	updateCategory
} from '$lib/server/db/categories';
import { listProducts } from '$lib/server/db/products';
import { slugify } from '$lib/server/productForm';

export const load: PageServerLoad = async ({ locals }) => {
	const [categories, products] = await Promise.all([
		listCategories(locals.supabase),
		listProducts(locals.supabase, { sort: 'curated' })
	]);

	// So the UI can warn before a delete that would orphan products.
	const counts = Object.fromEntries(
		categories.map((category) => [
			category.id,
			products.filter((product) => product.categoryId === category.id).length
		])
	);

	return { categories, counts };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const slug = slugify(String(data.get('slug') ?? '') || name);
		const description = String(data.get('description') ?? '').trim();
		const sortOrder = Number(data.get('sortOrder') ?? 0) || 0;

		if (!name) return fail(400, { ok: false, message: 'A name is required.' });
		if (!slug) return fail(400, { ok: false, message: 'Could not build a slug from that name.' });

		try {
			await createCategory(locals.supabase, {
				name,
				slug,
				description: description || null,
				sortOrder
			});
			return { ok: true, message: `“${name}” added.` };
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : '';
			console.error('[admin/categories] create failed:', cause);
			return fail(400, {
				ok: false,
				message: message.includes('duplicate key')
					? 'That slug is already in use.'
					: 'Could not create that category.'
			});
		}
	},

	update: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const name = String(data.get('name') ?? '').trim();
		const description = String(data.get('description') ?? '').trim();
		const sortOrder = Number(data.get('sortOrder') ?? 0) || 0;

		if (!id || !name) return fail(400, { ok: false, message: 'A name is required.' });

		try {
			// The slug is intentionally not editable here: it is in every existing
			// /shop?category= link, and silently breaking those is worse than
			// living with a slug that no longer matches a renamed category.
			await updateCategory(locals.supabase, id, {
				name,
				description: description || null,
				sortOrder
			});
			return { ok: true, message: 'Category updated.' };
		} catch (cause) {
			console.error('[admin/categories] update failed:', cause);
			return fail(500, { ok: false, message: 'Could not update that category.' });
		}
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400, { ok: false, message: 'No category specified.' });

		try {
			// Products survive: the foreign key is ON DELETE SET NULL, so they
			// become uncategorised rather than disappearing with the category.
			await deleteCategory(locals.supabase, id);
			return { ok: true, message: 'Category deleted. Its products are now uncategorised.' };
		} catch (cause) {
			console.error('[admin/categories] delete failed:', cause);
			return fail(500, { ok: false, message: 'Could not delete that category.' });
		}
	}
};
