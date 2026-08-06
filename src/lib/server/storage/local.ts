import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { assertSafeKey, type ImageStore } from './types';

/**
 * Filesystem driver, writing under `static/uploads/products/`.
 *
 * FOR LOCAL DEVELOPMENT AND `adapter-node` WITH A PERSISTENT VOLUME ONLY.
 *
 * It does not work on Vercel and cannot be made to: `static/` is copied at
 * BUILD time, and the serverless filesystem is read-only and ephemeral. An
 * upload would appear to succeed, then vanish with the instance — and would
 * never have been visible to any other instance in the first place. Use the
 * `supabase` driver anywhere it matters. See ARCHITECTURE.md.
 */
export class LocalStaticStore implements ImageStore {
	/** Absolute path of the directory keys are resolved inside. */
	private readonly root: string;

	constructor(root = join(process.cwd(), 'static', 'uploads')) {
		this.root = resolve(root);
	}

	/** Resolves a key to an absolute path, refusing anything outside the root. */
	private pathFor(key: string): string {
		assertSafeKey(key);

		const full = resolve(join(this.root, key));

		// Belt and braces: assertSafeKey already rejects `..`, but resolve() is
		// the authority on where a path actually lands, so check the result too.
		if (full !== this.root && !full.startsWith(this.root + sep)) {
			throw new Error(`Storage key escapes the upload root: ${key}`);
		}

		return full;
	}

	async put(key: string, data: Buffer): Promise<void> {
		const path = this.pathFor(key);
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, data);
	}

	async delete(key: string): Promise<void> {
		// `force` so deleting an object that is already gone is a no-op — the
		// caller is trying to reach a state, not perform a transaction.
		await rm(this.pathFor(key), { force: true });
	}

	async read(key: string): Promise<{ body: ReadableStream; contentType: string } | null> {
		const path = this.pathFor(key);

		try {
			const info = await stat(path);
			if (!info.isFile()) return null;
		} catch {
			return null;
		}

		return {
			body: Readable.toWeb(createReadStream(path)) as ReadableStream,
			contentType: contentTypeFor(key)
		};
	}
}

function contentTypeFor(key: string): string {
	if (key.endsWith('.webp')) return 'image/webp';
	if (key.endsWith('.avif')) return 'image/avif';
	if (key.endsWith('.png')) return 'image/png';
	if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
	return 'application/octet-stream';
}
