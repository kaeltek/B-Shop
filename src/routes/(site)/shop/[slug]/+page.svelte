<script lang="ts">
	import type { PageProps } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import { mediaSrcset, mediaUrl } from '$lib/utils/media';
	import { primaryImage } from '$lib/types/catalogue';
	import { reveal } from '$lib/actions/reveal';

	let { data }: PageProps = $props();

	const product = $derived(data.product);
	const commerce = $derived(data.commerce);
	const hero = $derived(primaryImage(product));
	const soldOut = $derived(!product.isAvailable);
</script>

<svelte:head>
	<title>{product.name} — shop</title>
	{#if product.summary}
		<meta name="description" content={product.summary} />
	{/if}
	<!--
		Built and escaped in +page.server.ts — see buildJsonLd. Writing the
		script tag in this file instead confuses both the Svelte compiler and
		the ESLint parser, and puts the `<` escaping further from the
		serialisation that makes it necessary.
	-->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.jsonLdTag}
</svelte:head>

<article class="section-y">
	<div class="container-page">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="/shop">Shop</a>
			<span aria-hidden="true">/</span>
			<span aria-current="page">{product.name}</span>
		</nav>

		<div class="layout">
			<div class="gallery">
				<figure class="main">
					{#if hero}
						<img
							src={mediaUrl(hero.storageKey)}
							srcset={mediaSrcset(hero.storageKey)}
							sizes="(min-width: 56rem) 50vw, 100vw"
							alt={hero.altText}
							width={hero.width}
							height={hero.height}
							fetchpriority="high"
							decoding="async"
						/>
					{:else}
						<PlaceholderImage seed={product.slug} alt="" />
					{/if}
				</figure>

				{#if product.images.length > 1}
					<ul class="thumbs">
						{#each product.images as image (image.id)}
							<li>
								<img
									src={mediaUrl(image.storageKey)}
									alt={image.altText}
									width={image.width}
									height={image.height}
									loading="lazy"
									decoding="async"
								/>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="detail">
				{#if product.tags.length > 0}
					<ul class="tags">
						{#each product.tags as tag (tag)}
							<li><a href="/shop?tag={encodeURIComponent(tag)}">{tag}</a></li>
						{/each}
					</ul>
				{/if}

				<h1 class="title display">{product.name}</h1>

				{#if product.summary}
					<p class="summary">{product.summary}</p>
				{/if}

				<Price
					cents={product.priceCents}
					currency={product.currency}
					{commerce}
					size="lg"
					class="pdp-price"
				/>

				<div class="actions">
					{#if commerce.enabled && !soldOut}
						<!-- Wired to the cart endpoint in P6, behind the §3.3 guard. -->
						<Button href="/cart">Add to cart</Button>
					{:else if soldOut}
						<p class="unavailable">
							Sold out for now. <a href="/contact">Ask us when the next batch lands.</a>
						</p>
					{:else}
						<Button href="/contact" variant="outline">Ask about this</Button>
					{/if}
				</div>

				{#if product.description}
					<div class="description">
						<h2 class="section-label">Details</h2>
						<p>{product.description}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</article>

{#if data.related.length > 0}
	<section class="related">
		<div class="container-page">
			<Eyebrow text="You might also like" />
			<h2 class="related-title display">More from the shop</h2>

			<div class="grid" use:reveal={{ stagger: 60 }}>
				{#each data.related as item (item.id)}
					<div class="reveal">
						<ProductCard product={item} {commerce} />
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.crumbs {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 2.5rem;
		font-size: 0.8125rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.crumbs a {
		color: var(--accent-text);
		text-decoration: none;
	}

	.layout {
		display: grid;
		gap: 3rem;
	}

	.main {
		margin: 0;
		border-radius: var(--radius-organic);
		overflow: hidden;
		aspect-ratio: 10 / 11;
		background-color: var(--color-sand);
	}

	.main :global(img),
	.main :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
	}

	.thumbs img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius-image);
	}

	.detail {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.25rem;
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
	}

	.tags a {
		color: var(--accent-text);
		text-decoration: none;
		border-bottom: 1px solid transparent;
	}

	.tags a:hover {
		border-color: currentColor;
	}

	.title {
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.summary {
		max-width: 46ch;
		font-size: 1.125rem;
		color: var(--color-muted);
	}

	.detail :global(.pdp-price) {
		margin-top: 0.25rem;
	}

	.actions {
		margin-top: 0.5rem;
	}

	.unavailable {
		font-size: 0.9375rem;
	}

	.unavailable a {
		color: var(--accent-text);
	}

	.description {
		margin-top: 1rem;
		border-top: 1px solid rgb(33 28 24 / 0.12);
		padding-top: 1.5rem;
		max-width: 56ch;
	}

	.section-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
		margin-bottom: 0.75rem;
	}

	.related {
		background-color: var(--color-sand);
		padding-block: clamp(4rem, 8vw, 6rem);
	}

	.related-title {
		margin-top: 0.75rem;
		margin-bottom: 3rem;
		font-size: clamp(1.75rem, 3.5vw, 2.5rem);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem 2rem;
	}

	@media (width >= 37.5rem) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (width >= 56rem) {
		.layout {
			grid-template-columns: 1fr 1fr;
			gap: 4.5rem;
			align-items: start;
		}
	}
</style>
