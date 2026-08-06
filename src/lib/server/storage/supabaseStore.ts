import { env as publicEnv } from '$env/dynamic/public';
import { createServiceClient } from '$lib/server/supabase';
import { assertSafeKey, type ImageStore } from './types';

export const BUCKET = 'product-images';

/**
 * Supabase Storage driver — the one to use on Vercel.
 *
 * Writes go through the service-role client. Storage RLS would also permit an
 * admin session, but uploads happen inside a server action that has already
 * checked `is_admin`, and the service client avoids depending on the caller's
 * cookies surviving into the storage request.
 */
export class SupabaseStore implements ImageStore {
	async put(key: string, data: Buffer, contentType: string): Promise<void> {
		assertSafeKey(key);

		const { error } = await createServiceClient().storage.from(BUCKET).upload(key, data, {
			contentType,
			// Keys embed a UUID so collisions mean a retry of the same upload,
			// not a different image. Overwriting is the safe resolution.
			upsert: true,
			// Keys are effectively content-addressed, so the object behind one
			// never changes and can be cached indefinitely (§4.2).
			cacheControl: '31536000'
		});

		if (error) throw new Error(`Storage upload failed for ${key}: ${error.message}`);
	}

	async delete(key: string): Promise<void> {
		assertSafeKey(key);

		const { error } = await createServiceClient().storage.from(BUCKET).remove([key]);
		if (error) throw new Error(`Storage delete failed for ${key}: ${error.message}`);
	}

	async read(key: string): Promise<{ body: ReadableStream; contentType: string } | null> {
		assertSafeKey(key);

		const { data, error } = await createServiceClient().storage.from(BUCKET).download(key);
		if (error || !data) return null;

		return {
			body: data.stream() as ReadableStream,
			contentType: data.type || 'application/octet-stream'
		};
	}

	/**
	 * The bucket is public, so /media can redirect instead of proxying bytes
	 * through a serverless function.
	 */
	redirectUrl(key: string): string | null {
		assertSafeKey(key);

		const base = publicEnv.PUBLIC_SUPABASE_URL;
		if (!base) return null;

		return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
	}
}
