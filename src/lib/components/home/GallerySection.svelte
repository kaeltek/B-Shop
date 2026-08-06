<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import Lightbox from '$lib/components/ui/Lightbox.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { GalleryItem, SectionIntro } from '$lib/types/home';

	/** Asymmetric masonry with a keyboard-navigable lightbox (§8.9). */
	interface Props {
		intro: SectionIntro;
		items: GalleryItem[];
	}

	let { intro, items }: Props = $props();

	let openIndex = $state<number | null>(null);
</script>

<section class="section-y">
	<div class="container-page">
		<header class="head">
			<Eyebrow text={intro.eyebrow} />
			<h2 class="heading display">{intro.heading}</h2>
		</header>

		<ul class="masonry" use:reveal={{ stagger: 60 }}>
			{#each items as item, i (item.seed)}
				<li class="tile {item.shape} reveal">
					<button type="button" onclick={() => (openIndex = i)}>
						<PlaceholderImage seed={item.seed} alt="" />
						<span class="sr-only">Open image: {item.alt}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</section>

<Lightbox
	items={items.map((item) => ({ seed: item.seed, alt: item.alt }))}
	index={openIndex}
	onclose={() => (openIndex = null)}
	onnavigate={(next) => (openIndex = next)}
/>

<style>
	.head {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 40ch;
		margin-bottom: 3rem;
	}

	.heading {
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.masonry {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 11rem;
		gap: 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tile {
		overflow: hidden;
		border-radius: var(--radius-image);
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

	.tile :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-card);
	}

	.tile:hover :global(svg),
	.tile button:focus-visible :global(svg) {
		transform: scale(1.05);
	}

	.tall {
		grid-row: span 2;
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
		.masonry {
			grid-template-columns: repeat(4, 1fr);
			grid-auto-rows: 13rem;
		}

		.wide {
			grid-column: span 2;
		}
	}
</style>
