import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProductById, setProductTags, updateProduct } from '$lib/server/db/products';
import { listCategories } from '$lib/server/db/categories';
import {
	addImage,
	deleteImage,
	listImagesForProduct,
	reorderImages,
	setPrimaryImage,
	updateImage
} from '$lib/server/db/images';
import { getImageStore } from '$lib/server/storage';
import { processUpload, rollback, UploadError, variantKeys } from '$lib/server/images/pipeline';
import { describeWriteError, parseProductForm } from '$lib/server/productForm';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const [product, categories] = await Promise.all([
		getProductById(locals.supabase, params.id),
		listCategories(locals.supabase)
	]);

	if (!product) error(404, 'That product does not exist.');

	return { product, categories, justCreated: url.searchParams.has('created') };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		const data = await request.formData();
		const { values, tags, errors } = parseProductForm(data);

		// §6 — alt text is required before publish. Enforced here rather than in
		// the browser, because a disabled button is not a rule.
		if (values.isPublished) {
			const images = await listImagesForProduct(locals.supabase, params.id);
			if (images.some((image) => image.altText.trim() === '')) {
				errors.isPublished = 'Every image needs alt text before this can be published.';
			}
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, message: 'Nothing was saved.' });
		}

		try {
			await updateProduct(locals.supabase, params.id, values);
			await setProductTags(locals.supabase, params.id, tags);
			return { ok: true, message: 'Saved.' };
		} catch (cause) {
			console.error('[admin/products/edit] save failed:', cause);
			return fail(400, {
				errors: { form: describeWriteError(cause) },
				message: 'Nothing was saved.'
			});
		}
	},

	/**
	 * Upload (§4.3).
	 *
	 * Bytes are written first, then the row. If the row insert fails, the
	 * objects just written are removed — an orphaned file is invisible waste,
	 * whereas a row pointing at nothing is a broken image on the storefront.
	 */
	upload: async ({ request, locals, params }) => {
		const data = await request.formData();
		const file = data.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { ok: false, message: 'Choose an image to upload.' });
		}

		let processed;
		try {
			processed = await processUpload(params.id, file);
		} catch (cause) {
			const status = cause instanceof UploadError ? cause.status : 500;
			const message =
				cause instanceof UploadError ? cause.message : 'That image could not be processed.';
			if (!(cause instanceof UploadError)) console.error('[admin/upload] failed:', cause);
			return fail(status, { ok: false, message });
		}

		try {
			const existing = await listImagesForProduct(locals.supabase, params.id);

			await addImage(locals.supabase, {
				productId: params.id,
				storageKey: processed.storageKey,
				altText: String(data.get('altText') ?? '').trim(),
				width: processed.width,
				height: processed.height,
				sortOrder: existing.length,
				// The first image a product gets becomes its primary, so a product
				// is never left without one.
				isPrimary: existing.length === 0
			});

			return { ok: true, message: 'Image uploaded.' };
		} catch (cause) {
			await rollback(processed.writtenKeys);
			console.error('[admin/upload] row insert failed, objects rolled back:', cause);
			return fail(500, { ok: false, message: 'The image was not saved. Please try again.' });
		}
	},

	altText: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('imageId') ?? '');
		const altText = String(data.get('altText') ?? '').trim();

		if (!id) return fail(400, { ok: false, message: 'No image specified.' });

		try {
			await updateImage(locals.supabase, id, { altText });
			return { ok: true, message: 'Alt text saved.' };
		} catch (cause) {
			console.error('[admin/altText] failed:', cause);
			return fail(500, { ok: false, message: 'Could not save that alt text.' });
		}
	},

	primary: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('imageId') ?? '');
		if (!id) return fail(400, { ok: false, message: 'No image specified.' });

		try {
			await setPrimaryImage(locals.supabase, id);
			return { ok: true, message: 'Primary image updated.' };
		} catch (cause) {
			console.error('[admin/primary] failed:', cause);
			return fail(500, { ok: false, message: 'Could not set the primary image.' });
		}
	},

	reorderImages: async ({ request, locals, params }) => {
		const data = await request.formData();
		const ids = String(data.get('order') ?? '')
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);

		if (ids.length === 0) return fail(400, { ok: false, message: 'No order supplied.' });

		try {
			await reorderImages(locals.supabase, params.id, ids);
			return { ok: true, message: 'Image order saved.' };
		} catch (cause) {
			console.error('[admin/reorderImages] failed:', cause);
			return fail(500, { ok: false, message: 'Could not save the image order.' });
		}
	},

	deleteImage: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('imageId') ?? '');
		if (!id) return fail(400, { ok: false, message: 'No image specified.' });

		try {
			// The row goes first and hands back its key, so a failed object
			// delete leaves a stray file rather than a broken image.
			const key = await deleteImage(locals.supabase, id);

			if (key) {
				const store = getImageStore();
				await Promise.all(
					variantKeys(key).map((variant) =>
						store
							.delete(variant)
							.catch((cause) => console.error(`[admin] orphaned object ${variant}`, cause))
					)
				);
			}

			return { ok: true, message: 'Image deleted.' };
		} catch (cause) {
			console.error('[admin/deleteImage] failed:', cause);
			return fail(500, { ok: false, message: 'Could not delete that image.' });
		}
	}
};
