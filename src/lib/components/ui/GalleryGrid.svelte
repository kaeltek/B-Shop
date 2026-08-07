<script lang="ts">
	import Lightbox from '$lib/components/ui/Lightbox.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { GalleryImage } from '$lib/types/home';

	/**
	 * The gallery grid and its lightbox (§8.9).
	 *
	 * Shared by the homepage section and the `/gallery` page so both get the same
	 * spacing, the same hover, the same staggered reveal and the same keyboard
	 * handling — the two differ only in how many images they are handed.
	 *
	 * The photography is square, so the tiles are square and the grid is uniform:
	 * nothing is cropped, and a phone shows the same composition a desktop does.
	 */
	interface Props {
		images: GalleryImage[];
		/**
		 * Eager-load the first row instead of deferring it. Set on `/gallery`,
		 * where the grid is the reason the page was opened; left off on the
		 * homepage, where it sits far below the fold.
		 */
		priority?: boolean;
	}

	let { images, priority = false }: Props = $props();

	let openIndex = $state<number | null>(null);

	/**
	 * Tile width at each breakpoint of the grid below, so the browser picks the
	 * narrowest variant that still covers the slot.
	 */
	const SIZES = '(min-width: 80rem) 296px, (min-width: 64rem) 23vw, (min-width: 48rem) 30vw, 45vw';
</script>

<!-- `data-gallery-grid` is the e2e handle. `.grid` is a common class name in this
	codebase and Svelte scopes it per-component, so it identifies nothing on its
	own from outside. -->
<ul class="grid" data-gallery-grid use:reveal={{ stagger: 60 }}>
	{#each images as image, i (image.id)}
		<li class="tile reveal">
			<button type="button" onclick={() => (openIndex = i)}>
				<img
					src={image.src}
					srcset={image.srcset}
					sizes={SIZES}
					width={image.width}
					height={image.height}
					alt=""
					loading={priority && i < 4 ? 'eager' : 'lazy'}
					decoding="async"
				/>
				<span class="sr-only">Open image: {image.alt}</span>
			</button>
		</li>
	{/each}
</ul>

<Lightbox
	{images}
	index={openIndex}
	onclose={() => (openIndex = null)}
	onnavigate={(next) => (openIndex = next)}
/>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tile {
		overflow: hidden;
		border-radius: var(--radius-image);
		/* Square, matching the source photography — the tile never crops. */
		aspect-ratio: 1;
		background-color: var(--color-sand);
	}

	.tile button {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		padding: 0;
		background: none;
		cursor: pointer;
	}

	.tile img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-card);
	}

	.tile:hover img,
	.tile button:focus-visible img {
		transform: scale(1.05);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	@media (width >= 48rem) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.25rem;
		}
	}

	@media (width >= 64rem) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
