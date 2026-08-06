<script lang="ts">
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import { mediaSrcset, mediaUrl } from '$lib/utils/media';
	import { primaryImage, type CommerceSettings, type Product } from '$lib/types/catalogue';

	/**
	 * Product card (§7.3 #3, §8.5).
	 *
	 * The gate surface. When commerce is on, the action row offers "Add to
	 * cart"; when it is off, the identical motion reveals "View details". Never
	 * a disabled button, never a "temporarily unavailable" stub (§1).
	 *
	 * The card is not wrapped in an anchor — a button inside a link is invalid
	 * and breaks keyboard semantics. Instead the title's link stretches over the
	 * card with `::after`, and the action row sits above it on the z axis.
	 */
	interface Props {
		product: Product;
		commerce: CommerceSettings;
		/** True for the first row above the fold — sets fetchpriority. */
		eager?: boolean;
	}

	let { product, commerce, eager = false }: Props = $props();

	const image = $derived(primaryImage(product));
	const soldOut = $derived(!product.isAvailable);
</script>

<article class="card">
	<div class="media">
		{#if image}
			<img
				src={mediaUrl(image.storageKey)}
				srcset={mediaSrcset(image.storageKey)}
				sizes="(min-width: 900px) 30vw, (min-width: 600px) 45vw, 90vw"
				alt={image.altText}
				width={image.width}
				height={image.height}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				decoding="async"
			/>
		{:else}
			<PlaceholderImage seed={product.slug} alt="" />
		{/if}

		<div class="overlay" aria-hidden="true"></div>

		{#if soldOut}
			<p class="badge">Sold out</p>
		{/if}

		<div class="actions">
			{#if commerce.enabled && !soldOut}
				<!-- Wired to the cart endpoint in P6. The server-side guard in
				     §3.3 is what actually protects this; hiding the button is
				     presentation, not enforcement. -->
				<a class="action primary" href="/shop/{product.slug}">Add to cart</a>
			{:else}
				<a class="action" href="/shop/{product.slug}">View details</a>
			{/if}
		</div>
	</div>

	<div class="body">
		{#if product.tags.length > 0}
			<ul class="tags">
				{#each product.tags.slice(0, 3) as tag (tag)}
					<li>{tag}</li>
				{/each}
			</ul>
		{/if}

		<h3 class="title">
			<a href="/shop/{product.slug}">{product.name}</a>
		</h3>

		{#if product.summary}
			<p class="summary">{product.summary}</p>
		{/if}

		<Price cents={product.priceCents} currency={product.currency} {commerce} size="md" />
	</div>
</article>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.media {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius-card);
		/* 10:11 portrait (§8.5) */
		aspect-ratio: 10 / 11;
		background-color: var(--color-sand);
	}

	.media :global(img),
	.media :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-card);
	}

	.card:hover .media :global(img),
	.card:hover .media :global(svg),
	.card:focus-within .media :global(img),
	.card:focus-within .media :global(svg) {
		transform: scale(1.04);
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(33 28 24 / 0.55), rgb(192 138 62 / 0.12) 55%);
		opacity: 0;
		transition: opacity 400ms var(--ease-card);
	}

	.card:hover .overlay,
	.card:focus-within .overlay {
		opacity: 1;
	}

	.badge {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		z-index: 2;
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.3rem 0.85rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	/* Rises from the bottom edge (§7.3 #3). */
	.actions {
		position: absolute;
		inset-inline: 0.9rem;
		bottom: 0.9rem;
		z-index: 2;
		display: flex;
		justify-content: center;
		opacity: 0;
		transform: translateY(0.75rem);
		transition:
			opacity 400ms var(--ease-card),
			transform 400ms var(--ease-card);
	}

	.card:hover .actions,
	.card:focus-within .actions {
		opacity: 1;
		transform: none;
	}

	.action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.75rem 1.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
		transition:
			background-color 250ms var(--ease-card),
			color 250ms var(--ease-card);
	}

	.action:hover {
		background-color: var(--color-accent);
	}

	.action.primary {
		background-color: var(--color-accent);
	}

	.action.primary:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	.tags li:not(:last-child)::after {
		content: '·';
		margin-left: 0.5rem;
		color: var(--color-muted);
	}

	.title {
		font-size: 1.375rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.title a {
		color: inherit;
		text-decoration: none;
	}

	/* Stretches the title link over the whole card so the entire tile is one
	   click target, while the action row stays above it at z-index 2. */
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.card:hover .title a,
	.title a:focus-visible {
		color: var(--color-accent-strong);
	}

	.summary {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-muted);
	}

	/* Touch devices have no hover, so the action row is always visible (§7.3). */
	@media (hover: none) {
		.actions {
			opacity: 1;
			transform: none;
		}

		.overlay {
			opacity: 1;
		}
	}
</style>
