import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { getImageStore } from '$lib/server/storage';

/**
 * GET /media/<key> — the single public URL for every stored image (§4.2).
 *
 * Because the database holds only a key and every consumer goes through this
 * route, switching IMAGE_STORE between `local` and `supabase` requires no
 * migration and no component change.
 *
 * Keys embed a UUID and a width, so the bytes behind a given key never change
 * and it is safe to cache them forever.
 */
const IMMUTABLE = 'public, max-age=31536000, immutable';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const key = params.key;
	if (!key) error(404, 'Not found');

	const store = getImageStore();

	// Prefer a redirect when the driver has a public URL: it keeps a serverless
	// function out of the path of every image and lets the CDN do the work.
	// `assertSafeKey` runs inside the driver, so a malicious key is rejected
	// before it becomes either a URL or a filesystem path.
	let target: string | null = null;
	try {
		target = store.redirectUrl?.(key) ?? null;
	} catch {
		error(400, 'Bad request');
	}

	if (target) redirect(302, target);

	let object: { body: ReadableStream; contentType: string } | null;
	try {
		object = await store.read(key);
	} catch {
		error(400, 'Bad request');
	}

	if (!object) error(404, 'Not found');

	setHeaders({
		'content-type': object.contentType,
		'cache-control': IMMUTABLE
	});

	return new Response(object.body);
};
