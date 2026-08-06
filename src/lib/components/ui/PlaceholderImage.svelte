<script lang="ts">
	/**
	 * Deterministic placeholder artwork.
	 *
	 * §7 says to use placeholder imagery and explicitly forbids copying the
	 * reference site's photography. Rather than ship stock photos of somebody
	 * else's food, this draws an abstract mark from the brand palette: it reads
	 * as intentional, weighs nothing, scales to any size and cannot be mistaken
	 * for a real photograph of this business.
	 *
	 * Every product image on the storefront comes from `product_images` via
	 * /media. This is the fallback for a product with no image yet, and the
	 * stand-in for editorial photography that only the client can supply.
	 */
	interface Props {
		/** Any stable string. The same seed always draws the same artwork. */
		seed: string;
		/** Describes what the real image will show. Empty marks it decorative. */
		alt: string;
		class?: string;
	}

	let { seed, alt, class: className = '' }: Props = $props();

	// FNV-1a. Small, fast, and stable across server and client so SSR and
	// hydration draw the same thing.
	function hash(value: string): number {
		let h = 2166136261;
		for (let i = 0; i < value.length; i++) {
			h ^= value.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	}

	const PALETTES = [
		{ from: '#EDE2D1', to: '#DCC9A8', mark: '#C08A3E' },
		{ from: '#F0E6D6', to: '#C9B48E', mark: '#8A6A34' },
		{ from: '#E6DCC8', to: '#B9A77F', mark: '#3A3D2E' },
		{ from: '#DED3BC', to: '#A99871', mark: '#5C4A2A' }
	];

	const h = $derived(hash(seed));
	const palette = $derived(PALETTES[h % PALETTES.length]);
	const rotation = $derived(h % 360);
	const gradientId = $derived(`ph-grad-${h.toString(36)}`);
	const variant = $derived(h % 3);
</script>

<svg
	class="placeholder {className}"
	viewBox="0 0 400 400"
	preserveAspectRatio="xMidYMid slice"
	role={alt ? 'img' : 'presentation'}
	aria-label={alt || undefined}
	aria-hidden={alt ? undefined : 'true'}
>
	<defs>
		<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color={palette.from} />
			<stop offset="100%" stop-color={palette.to} />
		</linearGradient>
	</defs>

	<rect width="400" height="400" fill="url(#{gradientId})" />

	<g
		transform="rotate({rotation} 200 200)"
		stroke={palette.mark}
		fill="none"
		stroke-width="1.5"
		opacity="0.4"
	>
		{#if variant === 0}
			<!-- Wheat -->
			<path d="M200 320 L200 110" stroke-width="2" />
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ellipse
					cx="182"
					cy={150 + i * 34}
					rx="17"
					ry="9"
					transform="rotate(-28 182 {150 + i * 34})"
				/>
				<ellipse
					cx="218"
					cy={150 + i * 34}
					rx="17"
					ry="9"
					transform="rotate(28 218 {150 + i * 34})"
				/>
			{/each}
		{:else if variant === 1}
			<!-- Olive sprig -->
			<path d="M110 300 Q200 240 300 130" stroke-width="2" />
			{#each [0, 1, 2, 3] as i (i)}
				<ellipse
					cx={150 + i * 42}
					cy={272 - i * 44}
					rx="24"
					ry="12"
					transform="rotate({-42 + i * 6} {150 + i * 42} {272 - i * 44})"
				/>
			{/each}
			<circle cx="300" cy="130" r="13" />
		{:else}
			<!-- Concentric rings, like a cut citrus -->
			{#each [140, 108, 76, 44] as r (r)}
				<circle cx="200" cy="200" {r} />
			{/each}
			{#each [0, 45, 90, 135] as a (a)}
				<line
					x1="200"
					y1="200"
					x2={200 + 140 * Math.cos((a * Math.PI) / 180)}
					y2={200 + 140 * Math.sin((a * Math.PI) / 180)}
				/>
			{/each}
		{/if}
	</g>
</svg>

<style>
	.placeholder {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
