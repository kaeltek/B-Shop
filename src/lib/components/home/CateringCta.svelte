<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { CateringContent } from '$lib/types/home';

	/** Full-bleed dark section over a background image with a warm overlay (§8.8). */
	interface Props {
		content: CateringContent;
	}

	let { content }: Props = $props();
</script>

<section class="catering on-dark">
	<div class="bg" aria-hidden="true">
		<PlaceholderImage seed={content.imageSeed} alt="" />
	</div>
	<div class="overlay" aria-hidden="true"></div>

	<div class="inner container-page" use:reveal>
		<div class="stack reveal">
			<Eyebrow text={content.eyebrow} centered />
			<h2 class="heading display">{content.heading}</h2>
			<p class="body">{content.body}</p>
			<Button href={content.ctaHref}>{content.ctaLabel}</Button>
		</div>
	</div>
</section>

<style>
	.catering {
		position: relative;
		isolation: isolate;
		padding-block: clamp(6rem, 12vw, 10rem);
		color: var(--color-cream);
	}

	.bg,
	.overlay {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.bg :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		/* Warm overlay rather than flat black — keeps the amber in the palette
		   and gets cream text to 9:1 against the darkest point. */
		background: linear-gradient(rgb(58 61 46 / 0.86), rgb(33 28 24 / 0.9));
	}

	.inner {
		display: flex;
		justify-content: center;
		text-align: center;
	}

	.stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		max-width: 46rem;
	}

	.heading {
		font-size: clamp(2.5rem, 5.5vw, 4rem);
		color: var(--color-cream);
	}

	.body {
		max-width: 48ch;
		color: color-mix(in srgb, var(--color-cream) 84%, transparent);
	}
</style>
