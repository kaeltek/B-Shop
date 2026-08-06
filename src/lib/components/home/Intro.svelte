<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { IntroContent } from '$lib/types/home';

	/** Two-column intro with two decorative accents (§8.3). */
	interface Props {
		content: IntroContent;
	}

	let { content }: Props = $props();
</script>

<section class="intro section-y">
	<DecorativeAccent mark="sprig" position="top-left" size={230} rotate={-12} />
	<DecorativeAccent mark="fennel" position="bottom-right" size={200} rotate={18} />

	<div class="container-page grid" use:reveal={{ stagger: 80 }}>
		<div class="copy reveal">
			<Eyebrow text={content.eyebrow} />
			<h2 class="heading display">{content.heading}</h2>
			{#each content.body as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
			<Button href={content.ctaHref} variant="outline">{content.ctaLabel}</Button>
		</div>

		<figure class="portrait reveal">
			<PlaceholderImage seed={content.imageSeed} alt={content.imageAlt} />
			{#if content.videoUrl}
				<!-- Rendered only when there is something to play (§8.3). -->
				<a class="play" href={content.videoUrl}>
					<span class="triangle" aria-hidden="true"></span>
					<span class="sr-only">{content.videoLabel}</span>
				</a>
			{/if}
		</figure>
	</div>
</section>

<style>
	.intro {
		position: relative;
		overflow: hidden;
	}

	.grid {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 3rem;
		align-items: center;
	}

	.copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.25rem;
	}

	.heading {
		max-width: 16ch;
		font-size: clamp(2.25rem, 4.5vw, 3.5rem);
	}

	.copy p {
		max-width: 52ch;
	}

	.copy :global(a) {
		margin-top: 0.75rem;
	}

	.portrait {
		position: relative;
		margin: 0;
		border-radius: var(--radius-organic);
		overflow: hidden;
		aspect-ratio: 4 / 5;
	}

	.portrait :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		color: var(--color-ink);
		transition:
			background-color 250ms var(--ease-card),
			scale 250ms var(--ease-card);
	}

	.play:hover {
		background-color: var(--color-accent);
		scale: 1.06;
	}

	.triangle {
		width: 0;
		height: 0;
		margin-left: 0.25rem;
		border-top: 0.6rem solid transparent;
		border-bottom: 0.6rem solid transparent;
		border-left: 1rem solid currentColor;
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

	@media (width >= 56rem) {
		.grid {
			grid-template-columns: 1.05fr 0.95fr;
			gap: 5rem;
		}
	}
</style>
