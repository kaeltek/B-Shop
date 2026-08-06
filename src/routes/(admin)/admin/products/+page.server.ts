import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteProduct, listProducts, updateProduct } from '$lib/server/db/products';
import { collectStorageKeys } from '$lib/server/db/images';
import { listCategories } from '$lib/server/db/categories';
import { getImageStore } from '$lib/server/storage';
import { variantKeys } from '$lib/server/images/pipeline';

export const load: PageServerLoad = async ({ locals, url }) => {
	const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();

	const [all, categories] = await Promise.all([
		listProducts(locals.supabase, { sort: 'curated' }),
		listCategories(locals.supabase)
	]);

	// Filtered in memory: the catalogue is small, and a single fetch keeps the
	// reorder list consistent with what is on screen. Move to a Postgres text
	// search when this stops being true.
	const products = query
		? all.filter(
				(product) =>
					product.name.toLowerCase().includes(query) ||
					product.slug.toLowerCase().includes(query) ||
					product.tags.some((tag) => tag.toLowerCase().includes(query))
			)
		: all;

	return { products, categories, query: url.searchParams.get('q') ?? '' };
};

export const actions: Actions = {
	/** Publish or unpublish everything that was ticked. */
	bulk: async ({ request, locals }) => {
		const data = await request.formData();
		const ids = data.getAll('selected').map(String).filter(Boolean);
		const publish = data.get('intent') === 'publish';

		if (ids.length === 0) {
			return fail(400, { ok: false, message: 'Nothing selected.' });
		}

		if (publish) {
			// §6 — alt text is required before publish, and this is where that is
			// enforced. Doing it in the UI only would let the bulk path skip it.
			const products = await listProducts(locals.supabase, { sort: 'curated' });
			const offenders = products
				.filter((product) => ids.includes(product.id))
				.filter((product) => product.images.some((image) => image.altText.trim() === ''));

			if (offenders.length > 0) {
				return fail(400, {
					ok: false,
					message: `Add alt text before publishing: ${offenders.map((p) => p.name).join(', ')}.`
				});
			}
		}

		try {
			await Promise.all(
				ids.map((id) => updateProduct(locals.supabase, id, { isPublished: publish }))
			);
			return {
				ok: true,
				message: `${ids.length} ${ids.length === 1 ? 'product' : 'products'} ${publish ? 'published' : 'unpublished'}.`
			};
		} catch (cause) {
			console.error('[admin/products] bulk failed:', cause);
			return fail(500, { ok: false, message: 'Could not update those products.' });
		}
	},

	/** Persists a new display order. */
	reorder: async ({ request, locals }) => {
		const data = await request.formData();
		const ids = String(data.get('order') ?? '')
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);

		if (ids.length === 0) return fail(400, { ok: false, message: 'No order supplied.' });

		try {
			await Promise.all(
				ids.map((id, index) => updateProduct(locals.supabase, id, { sortOrder: index * 10 }))
			);
			return { ok: true, message: 'Order saved.' };
		} catch (cause) {
			console.error('[admin/products] reorder failed:', cause);
			return fail(500, { ok: false, message: 'Could not save the new order.' });
		}
	},

	/**
	 * Deletes a product and its stored image objects.
	 *
	 * Keys are read BEFORE the row is deleted: `on delete cascade` removes the
	 * product_images rows, and once they are gone nothing records which objects
	 * belonged to it. Objects are removed after the row so a failed delete
	 * leaves an orphaned file rather than a product with broken images (§10).
	 */
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400, { ok: false, message: 'No product specified.' });

		try {
			const keys = await collectStorageKeys(locals.supabase, id);

			await deleteProduct(locals.supabase, id);

			const store = getImageStore();
			await Promise.all(
				keys
					.flatMap(variantKeys)
					.map((key) =>
						store
							.delete(key)
							.catch((cause) => console.error(`[admin/products] orphaned object ${key}`, cause))
					)
			);

			return { ok: true, message: 'Product deleted, along with its images.' };
		} catch (cause) {
			console.error('[admin/products] delete failed:', cause);
			return fail(500, { ok: false, message: 'Could not delete that product.' });
		}
	}
};
