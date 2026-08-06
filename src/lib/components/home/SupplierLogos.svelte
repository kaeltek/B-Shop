<script lang="ts">
	import { reveal } from '$lib/actions/reveal';

	/**
	 * Supplier marks (§8.7): one row of six, greyscale at 60% opacity going full
	 * colour on hover, wrapping to 3×2 on mobile.
	 *
	 * Drawn as typographic wordmarks rather than image files. These are
	 * fictional suppliers, so there are no real logos to load, and set in the
	 * display face they read as marks rather than as missing images.
	 */
	interface Props {
		suppliers: string[];
	}

	let { suppliers }: Props = $props();
</script>

<section class="logos">
	<div class="row container-page" use:reveal={{ stagger: 60 }}>
		{#each suppliers as supplier (supplier)}
			<span class="mark reveal">{supplier}</span>
		{/each}
	</div>
</section>

<style>
	.logos {
		padding-block: clamp(3rem, 6vw, 4.5rem);
		border-block: 1px solid rgb(33 28 24 / 0.08);
	}

	.row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem 1.5rem;
		align-items: center;
		justify-items: center;
	}

	.mark {
		font-family: var(--font-display);
		font-size: clamp(1rem, 1.6vw, 1.25rem);
		font-weight: 500;
		letter-spacing: 0.02em;
		text-align: center;
		color: var(--color-ink);
		filter: grayscale(1);
		opacity: 0.6;
		transition:
			opacity 300ms var(--ease-card),
			filter 300ms var(--ease-card),
			color 300ms var(--ease-card);
	}

	.mark:hover {
		filter: grayscale(0);
		opacity: 1;
		color: var(--color-accent-strong);
	}

	@media (width >= 56rem) {
		.row {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
