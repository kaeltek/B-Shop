<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { HomeContent, StripTile } from '$lib/types/home';

	/**
	 * Instagram strip (§8.12).
	 *
	 * Rendered from local data, never a live API call. A third-party feed on the
	 * critical path is a liability: it can be slow, rate-limited or simply gone,
	 * and none of those should be able to hurt the homepage.
	 *
	 * The tiles are the packaging range's own photographs, built by the load
	 * function from the same `product_images` rows and the same /media URLs the
	 * shop renders — no second copy of any asset, and nothing here that can
	 * drift from the catalogue. `content.items` is the fallback for when that
	 * category is empty or Supabase is unconfigured.
	 */
	interface Props {
		content: HomeContent['instagram'];
		tiles?: StripTile[];
	}

	let { content, tiles = [] }: Props = $props();
</script>

<section class="strip">
	<div class="head container-page">
		<Eyebrow text={content.eyebrow} centered />
		<h2 class="heading display">{content.heading}</h2>
		<a class="handle" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
			{content.handle}
		</a>
	</div>

	<ul class="row" use:reveal={{ stagger: 50 }}>
		{#if tiles.length > 0}
			{#each tiles as tile (tile.id)}
				<li class="reveal">
					<img
						src={tile.src}
						srcset={tile.srcset}
						sizes="(min-width: 48rem) 17vw, 34vw"
						alt={tile.alt}
						loading="lazy"
						decoding="async"
					/>
				</li>
			{/each}
		{:else}
			{#each content.items as item (item.seed)}
				<li class="reveal">
					<PlaceholderImage seed={item.seed} alt={item.alt} />
				</li>
			{/each}
		{/if}
	</ul>
</section>

<style>
	.strip {
		padding-block: clamp(4rem, 8vw, 6rem) 0;
	}

	.head {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.heading {
		font-size: clamp(1.75rem, 3vw, 2.5rem);
	}

	.handle {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--accent-text);
		text-decoration: none;
	}

	.handle:hover {
		color: var(--color-ink);
	}

	/* Full-bleed: the strip runs edge to edge rather than sitting in the
	   container, which is what makes it read as a feed. */
	.row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row li {
		aspect-ratio: 1;
		overflow: hidden;
	}

	.row img,
	.row :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-card);
	}

	.row li:hover img,
	.row li:hover :global(svg) {
		transform: scale(1.06);
	}

	@media (width >= 48rem) {
		.row {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
