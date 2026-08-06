<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { HomeContent } from '$lib/types/home';

	/**
	 * Instagram strip (§8.12).
	 *
	 * Rendered from local data, never a live API call. A third-party feed on the
	 * critical path is a liability: it can be slow, rate-limited or simply gone,
	 * and none of those should be able to hurt the homepage.
	 */
	interface Props {
		content: HomeContent['instagram'];
	}

	let { content }: Props = $props();
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
		{#each content.items as item (item.seed)}
			<li class="reveal">
				<PlaceholderImage seed={item.seed} alt={item.alt} />
			</li>
		{/each}
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

	.row :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-card);
	}

	.row li:hover :global(svg) {
		transform: scale(1.06);
	}

	@media (width >= 48rem) {
		.row {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
