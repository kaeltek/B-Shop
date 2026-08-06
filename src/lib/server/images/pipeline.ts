import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { getImageStore } from '$lib/server/storage';
import { IMAGE_WIDTHS } from '$lib/utils/media';

/**
 * Upload pipeline (§4.3).
 *
 * Order matters and is not incidental:
 *   1. refuse anything over 8 MB before reading the body
 *   2. sniff magic bytes — never trust the client Content-Type
 *   3. re-encode to WebP at three widths, strip EXIF, capture dimensions
 *   4. write every variant through the driver
 *   5. the caller inserts the row and, if that fails, calls `rollback`
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export class UploadError extends Error {
	constructor(
		message: string,
		readonly status = 400
	) {
		super(message);
		this.name = 'UploadError';
	}
}

/**
 * Identifies a format from its leading bytes.
 *
 * The client's Content-Type is a claim, not evidence (§4.3 step 2, §11): a
 * `.jpg` named file with a Content-Type of `image/jpeg` can contain anything
 * at all. What actually protects us is that sharp only decodes real images,
 * but refusing early gives a better error and keeps unknown formats away from
 * the decoder entirely.
 */
export function sniffFormat(buffer: Buffer): 'jpeg' | 'png' | 'webp' | 'avif' | null {
	if (buffer.length < 12) return null;

	// FF D8 FF
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';

	// 89 P N G \r \n \x1a \n
	if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return 'png';
	}

	// RIFF....WEBP
	if (
		buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
		buffer.subarray(8, 12).toString('ascii') === 'WEBP'
	) {
		return 'webp';
	}

	// ISO-BMFF: box size, then 'ftyp', then a brand. AVIF images are `avif`,
	// sequences are `avis`.
	if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
		const brand = buffer.subarray(8, 12).toString('ascii');
		if (brand === 'avif' || brand === 'avis') return 'avif';
	}

	return null;
}

export interface ProcessedImage {
	/** Key of the largest variant — what goes in the database. */
	storageKey: string;
	/** Every key written, for rollback and for deletion later. */
	writtenKeys: string[];
	width: number;
	height: number;
}

/**
 * Re-encodes an upload and writes every variant.
 *
 * On failure it removes anything it already wrote, so a half-finished upload
 * never leaves objects behind.
 */
export async function processUpload(productId: string, file: File): Promise<ProcessedImage> {
	// 1. Size, before the body is read into memory (§4.3 step 1). `file.size` is
	//    from the multipart headers, so this costs nothing.
	if (file.size > MAX_UPLOAD_BYTES) {
		throw new UploadError(
			`Image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.`,
			413
		);
	}
	if (file.size === 0) throw new UploadError('That file is empty.');

	const input = Buffer.from(await file.arrayBuffer());

	// Re-check after reading: `file.size` is a claim too.
	if (input.byteLength > MAX_UPLOAD_BYTES) {
		throw new UploadError('Image is larger than the 8 MB limit.', 413);
	}

	// 2. Magic bytes.
	const format = sniffFormat(input);
	if (!format) {
		throw new UploadError('That file is not a JPEG, PNG, WebP or AVIF image.');
	}

	// 3. Re-encode.
	//
	// `.rotate()` with no argument applies the EXIF orientation tag and then
	// drops it. Without it, phone photos that rely on that tag come out
	// sideways once the metadata is stripped. sharp writes no metadata unless
	// asked, so EXIF — including GPS coordinates from a phone — does not
	// survive this step (§4.3 step 3).
	const source = sharp(input, { failOn: 'error' }).rotate();

	const probe = await source.metadata().catch(() => null);
	if (!probe?.width || !probe?.height) {
		throw new UploadError('That image could not be decoded.');
	}

	const store = getImageStore();
	const base = `products/${productId}/${randomUUID()}`;
	const written: string[] = [];

	let width = 0;
	let height = 0;

	try {
		for (const target of IMAGE_WIDTHS) {
			const { data, info } = await source
				.clone()
				// Never upscale: a 500px original resized "up" to 1600 is a bigger
				// file that looks worse.
				.resize({ width: target, withoutEnlargement: true })
				.webp({ quality: 82 })
				.toBuffer({ resolveWithObject: true });

			const key = `${base}-${target}.webp`;
			await store.put(key, data, 'image/webp');
			written.push(key);

			// Intrinsic dimensions come from the largest variant actually
			// produced, so width/height match the file the browser gets and
			// reserve exactly the right space (§4.3, no CLS).
			if (info.width >= width) {
				width = info.width;
				height = info.height;
			}
		}
	} catch (cause) {
		await rollback(written);
		throw cause instanceof UploadError
			? cause
			: new UploadError('The image could not be processed.', 500);
	}

	return {
		storageKey: `${base}-${IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]}.webp`,
		writtenKeys: written,
		width,
		height
	};
}

/**
 * Removes objects after a failure (§4.3 step 5).
 *
 * Never throws: it runs on the error path, and losing the original failure
 * behind a cleanup error would hide what actually went wrong.
 */
export async function rollback(keys: string[]): Promise<void> {
	const store = getImageStore();

	await Promise.all(
		keys.map((key) =>
			store.delete(key).catch((cause) => {
				console.error(`[images] orphaned object, delete failed: ${key}`, cause);
			})
		)
	);
}

/** Every variant key derived from a stored key, for deletion. */
export function variantKeys(storageKey: string): string[] {
	const base = storageKey.replace(/-\d+\.webp$/, '');
	return IMAGE_WIDTHS.map((width) => `${base}-${width}.webp`);
}
