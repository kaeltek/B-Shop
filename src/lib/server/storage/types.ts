/**
 * Image storage driver (§4.1).
 *
 * The database stores a driver-relative KEY and nothing else (§4.2), so
 * switching drivers changes zero rows and zero components. Everything is served
 * through /media/[...key], which resolves the active driver per request.
 */
export interface ImageStore {
	put(key: string, data: Buffer, contentType: string): Promise<void>;
	delete(key: string): Promise<void>;
	read(key: string): Promise<{ body: ReadableStream; contentType: string } | null>;

	/**
	 * A URL the client can be redirected to, when the driver has one.
	 *
	 * Lets /media 302 to a CDN-backed object instead of streaming bytes through
	 * a serverless function — cheaper, faster, and it keeps the function out of
	 * the path of every image request. Drivers with no public URL return null
	 * and the endpoint streams via `read` instead.
	 */
	redirectUrl?(key: string): string | null;
}

/**
 * Rejects keys that try to escape their prefix.
 *
 * `LocalStaticStore` turns a key into a filesystem path, so `../../` in a key
 * would be a path traversal — a write anywhere the process can reach. Keys are
 * generated server-side today, but this is one validation that must not depend
 * on that staying true.
 */
export function assertSafeKey(key: string): void {
	if (
		!key ||
		key.startsWith('/') ||
		key.includes('..') ||
		key.includes('\\') ||
		key.includes('\0') ||
		!/^[a-zA-Z0-9/._-]+$/.test(key)
	) {
		throw new Error(`Unsafe storage key: ${JSON.stringify(key)}`);
	}
}
