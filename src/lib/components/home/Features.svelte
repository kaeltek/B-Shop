<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { FeaturesContent } from '$lib/types/home';

	/** Asymmetric two-column feature block (§8.6). */
	interface Props {
		content: FeaturesContent;
	}

	let { content }: Props = $props();
</script>

<section class="features section-y">
	<DecorativeAccent mark="wheat" position="top-right" size={210} rotate={14} opacity={0.1} />

	<div class="container-page grid" use:reveal={{ stagger: 80 }}>
		<div class="copy reveal">
			<Eyebrow text={content.eyebrow} />
			<h2 class="heading display">{content.heading}</h2>
			<p>{content.body}</p>
			<Button href={content.ctaHref} variant="outline">{content.ctaLabel}</Button>
		</div>

		<div class="aside reveal">
			<dl class="stats">
				{#each content.stats as stat (stat.label)}
					<div class="stat">
						<dt>{stat.value}</dt>
						<dd>{stat.label}</dd>
					</div>
				{/each}
			</dl>

			<figure class="figure">
				<PlaceholderImage seed={content.imageSeed} alt={content.imageAlt} />
			</figure>
		</div>
	</div>
</section>

<style>
	.features {
		position: relative;
		overflow: hidden;
		background-color: var(--color-sand);
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
		max-width: 15ch;
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.copy p {
		max-width: 50ch;
	}

	.aside {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin: 0;
	}

	.stat dt {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}

	.stat dd {
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.figure {
		margin: 0;
		border-radius: var(--radius-organic);
		overflow: hidden;
		aspect-ratio: 16 / 10;
	}

	.figure :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (width >= 56rem) {
		.grid {
			/* Asymmetric on purpose (§8.6) — not a 50/50 split. */
			grid-template-columns: 1.15fr 0.85fr;
			gap: 5rem;
		}
	}
</style>
