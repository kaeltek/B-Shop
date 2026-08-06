import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProduct, setProductTags } from '$lib/server/db/products';
import { listCategories } from '$lib/server/db/categories';
import { describeWriteError, parseProductForm } from '$lib/server/productForm';

export const load: PageServerLoad = async ({ locals }) => {
	return { categories: await listCategories(locals.supabase) };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const { values, tags, errors } = parseProductForm(data);

		// A brand new product has no images, so it cannot have alt text yet.
		// Publishing it here would slip past the alt-text rule; the edit page
		// enforces that once images exist.
		if (values.isPublished) {
			errors.isPublished = 'Add images and alt text first, then publish from the edit screen.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { ...values, tags: tags.join(', ') } });
		}

		try {
			const product = await createProduct(locals.supabase, { ...values, isPublished: false });
			if (tags.length > 0) await setProductTags(locals.supabase, product.id, tags);

			redirect(303, `/admin/products/${product.id}?created=1`);
		} catch (cause) {
			// SvelteKit signals redirects by throwing; rethrow rather than
			// reporting a successful save as a failure.
			if (cause instanceof Response || (cause as { status?: number })?.status === 303) throw cause;

			console.error('[admin/products/new] failed:', cause);
			return fail(400, {
				errors: { form: describeWriteError(cause) },
				values: { ...values, tags: tags.join(', ') }
			});
		}
	}
};
