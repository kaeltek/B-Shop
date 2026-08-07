<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import GalleryGrid from '$lib/components/ui/GalleryGrid.svelte';
	import type { GalleryImage, SectionIntro } from '$lib/types/home';

	/**
	 * Homepage gallery (§8.9). The grid, the hover, the stagger and the lightbox
	 * all live in `GalleryGrid`, shared with `/gallery` — this is the section
	 * header and the link through to the rest.
	 */
	interface Props {
		intro: SectionIntro;
		images: GalleryImage[];
	}

	let { intro, images }: Props = $props();
</script>

<section class="section-y">
	<div class="container-page">
		<header class="head">
			<Eyebrow text={intro.eyebrow} />
			<h2 class="heading display">{intro.heading}</h2>
		</header>

		<GalleryGrid {images} />

		<p class="more">
			<a href="/gallery">See the full gallery</a>
		</p>
	</div>
</section>

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

	.more {
		margin-top: 2.5rem;
		text-align: center;
	}

	.more a {
		display: inline-block;
		border: 1px solid rgb(33 28 24 / 0.2);
		border-radius: var(--radius-pill);
		padding: 0.85rem 1.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--color-ink);
		transition:
			background-color 250ms var(--ease-card),
			border-color 250ms var(--ease-card),
			color 250ms var(--ease-card);
	}

	.more a:hover {
		background-color: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-cream);
	}
</style>
