/**
 * Pre-encodes the homepage section photography.
 *
 * Unlike the gallery and hero art, the sources here live inside `static/` —
 * `static/homepage-images/*.png` are the files the client supplied and the ones
 * the markup still names as the `<img>` fallback. They are 2MB each, though, so
 * this writes the WebP variants that `<picture>` actually serves alongside
 * them; only a browser too old for WebP ever pays for the PNG.
 *
 * Same settings as the gallery and hero imagery (sharp, quality 86, never
 * upscaled past a source's own width). Run it after adding or replacing a
 * source:
 *
 *     node scripts/encode-homepage.mjs
 *
 * It prints a `srcset`/`width`/`height` block per image; those are what
 * `src/lib/content/home.ts` carries so the browser can reserve space.
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'static/homepage-images';

/** Widest use is the full-bleed banner; the two column images stop well short. */
const WIDTHS = [480, 768, 1024, 1440, 1920];
const QUALITY = 86;

const sources = (await readdir(DIR)).filter((name) => /\.(jpe?g|png)$/i.test(name));
sources.sort();

const manifest = {};

for (const name of sources) {
	const id = name.replace(/\.[^.]+$/, '');
	const image = sharp(path.join(DIR, name));
	const { width: sourceWidth, height: sourceHeight } = await image.metadata();

	// Never upscale — a variant wider than the source is bytes spent on
	// interpolation. The source's own width always ships as the widest variant.
	const widths = [...new Set([...WIDTHS.filter((w) => w < sourceWidth), sourceWidth])];
	const variants = [];

	for (const width of widths) {
		const output = path.join(DIR, `${id}-${width}.webp`);
		const info = await image.clone().resize({ width }).webp({ quality: QUALITY }).toFile(output);
		variants.push({ width: info.width, height: info.height });
	}

	manifest[id] = {
		src: `/homepage-images/${name}`,
		webpSrcset: variants
			.map((v) => `/homepage-images/${id}-${v.width}.webp ${v.width}w`)
			.join(', '),
		width: sourceWidth,
		height: sourceHeight
	};

	console.log(`${id.padEnd(20)} ${sourceWidth}x${sourceHeight} -> ${widths.join(', ')}`);
}

console.log(`\n${sources.length} images encoded. Manifest:\n`);
console.log(JSON.stringify(manifest, null, '\t'));
