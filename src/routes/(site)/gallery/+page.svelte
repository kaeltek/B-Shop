<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import Lightbox from '$lib/components/ui/Lightbox.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { galleryPage } from '$lib/content/pages';
	import { home } from '$lib/content/home';

	/**
	 * Full gallery. Reuses the homepage set and extends it — one source of
	 * imagery, and the lightbox is the same component with the same keyboard
	 * handling.
	 */
	const items = [
		...home.gallery.items,
		{ seed: 'gallery-7', alt: 'Bread cooling on the rack by the window', shape: 'square' as const },
		{ seed: 'gallery-8', alt: 'The pass during a busy service', shape: 'wide' as const },
		{ seed: 'gallery-9', alt: 'Coals raked flat before the first cook', shape: 'tall' as const }
	];

	let openIndex = $state<number | null>(null);
</script>

<svelte:head>
	<title>Gallery — {galleryPage.intro.title}</title>
	<meta name="description" content={galleryPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<div class="container-page">
		<Eyebrow text={galleryPage.intro.eyebrow} />
		<h1 class="title display">{galleryPage.intro.title}</h1>
		<p class="standfirst">{galleryPage.intro.standfirst}</p>
	</div>
</header>

<div class="container-page">
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

<div class="tail"></div>

<Lightbox
	items={items.map((item) => ({ seed: item.seed, alt: item.alt }))}
	index={openIndex}
	onclose={() => (openIndex = null)}
	onnavigate={(next) => (openIndex = next)}
/>

<style>
	.head {
		padding-bottom: 2.5rem;
	}

	.title {
		margin-top: 1rem;
		max-width: 20ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.5rem;
		max-width: 56ch;
		font-size: 1.125rem;
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

	.tail {
		height: clamp(5rem, 10vw, 9rem);
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
