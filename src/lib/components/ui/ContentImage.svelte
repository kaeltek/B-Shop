<script lang="ts">
	import type { SectionImage } from '$lib/types/home';

	/**
	 * A supplied section photograph (§8.3, §8.6, §8.8).
	 *
	 * The counterpart to `PlaceholderImage`: that one draws a mark where no
	 * photograph exists yet, this one renders a real photograph the client has
	 * provided. Product imagery is neither — it comes from `product_images` via
	 * /media and is rendered by the components that own it.
	 *
	 * `<picture>` rather than a plain `srcset`, because the fallback is the
	 * supplied PNG. The WebP variants are a twentieth of its weight, so serving
	 * them is not optional on a phone, but `srcset` alone would hand a browser
	 * without WebP support a URL it cannot decode. A `<source>` it does not
	 * understand is one it skips.
	 *
	 * The element fills its container; the container decides the aspect ratio.
	 */
	interface Props {
		image: SectionImage;
		/** Rendered width at each breakpoint, so the browser picks a variant. */
		sizes: string;
		/** True above the fold — loads eagerly and at high priority. */
		eager?: boolean;
		/** `object-position` for the cover crop, when centre is wrong. */
		focus?: string;
	}

	let { image, sizes, eager = false, focus }: Props = $props();
</script>

<picture>
	<source type="image/webp" srcset={image.webpSrcset} {sizes} />
	<img
		src={image.src}
		{sizes}
		alt={image.alt}
		width={image.width}
		height={image.height}
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'high' : 'auto'}
		decoding="async"
		style:object-position={focus}
	/>
</picture>

<style>
	picture {
		display: contents;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
