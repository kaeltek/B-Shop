/**
 * Pre-encodes the gallery photography.
 *
 * Sources live in `assets/gallery/` — outside `static/`, so the ~22MB of
 * originals are versioned but never copied into the build. This writes the
 * WebP variants the site actually references into `static/gallery/`.
 *
 * Same settings as the hero imagery (sharp, quality 86, never upscaled past a
 * source's own width). Run it after adding or replacing a source:
 *
 *     node scripts/encode-gallery.mjs
 *
 * It prints an `id`/`width`/`height` line per image; those numbers are what
 * `src/lib/content/gallery.ts` carries so the browser can reserve space.
 */
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'assets/gallery';
const OUTPUT_DIR = 'static/gallery';

/** Tiles render ~290px at the 4-column desktop maximum; 640 covers 2× DPR. */
const WIDTHS = [320, 640, 1024];
const QUALITY = 86;

const sources = (await readdir(SOURCE_DIR)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
sources.sort();

await mkdir(OUTPUT_DIR, { recursive: true });

const manifest = [];

for (const name of sources) {
	const id = name.replace(/\.[^.]+$/, '');
	const image = sharp(path.join(SOURCE_DIR, name));
	const { width: sourceWidth, height: sourceHeight } = await image.metadata();

	const variants = [];

	for (const width of WIDTHS) {
		// Never upscale — a variant wider than the source is bytes spent on
		// interpolation.
		if (width > sourceWidth) continue;

		const output = path.join(OUTPUT_DIR, `${id}-${width}.webp`);
		const info = await image.clone().resize({ width }).webp({ quality: QUALITY }).toFile(output);

		variants.push({ width: info.width, height: info.height });
	}

	// The source width itself, when no listed variant reaches it.
	if (variants.at(-1)?.width !== sourceWidth && !WIDTHS.includes(sourceWidth)) {
		const output = path.join(OUTPUT_DIR, `${id}-${sourceWidth}.webp`);
		const info = await image.clone().webp({ quality: QUALITY }).toFile(output);
		variants.push({ width: info.width, height: info.height });
	}

	const widest = variants.at(-1);
	manifest.push({
		id,
		src: `/gallery/${id}-${widest.width}.webp`,
		srcset: variants.map((v) => `/gallery/${id}-${v.width}.webp ${v.width}w`).join(', '),
		width: widest.width,
		height: widest.height
	});

	console.log(
		`${id.padEnd(34)} ${sourceWidth}x${sourceHeight} -> ${variants.map((v) => v.width).join(', ')}`
	);
}

console.log(`\n${manifest.length} images encoded. Manifest:\n`);
console.log(JSON.stringify(manifest, null, '\t'));
