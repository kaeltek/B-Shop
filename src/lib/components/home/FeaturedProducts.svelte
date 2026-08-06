<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { CommerceSettings, Product } from '$lib/types/catalogue';
	import type { SectionIntro } from '$lib/types/home';

	/**
	 * Featured product grid (§8.5) — the primary gate surface.
	 *
	 * The grid itself is identical in both modes. Only the affordance inside
	 * each card changes, which is the whole point: gated mode is a catalogue,
	 * not a broken shop.
	 */
	interface Props {
		intro: SectionIntro;
		products: Product[];
		commerce: CommerceSettings;
	}

	let { intro, products, commerce }: Props = $props();
</script>

{#if products.length > 0}
	<section class="section-y">
		<div class="container-page">
			<header class="head">
				<Eyebrow text={intro.eyebrow} />
				<h2 class="heading display">{intro.heading}</h2>
				{#if intro.body}
					<p class="body">{intro.body}</p>
				{/if}
			</header>

			<div class="grid" use:reveal={{ stagger: 60 }}>
				{#each products as product (product.id)}
					<div class="reveal">
						<ProductCard {product} {commerce} />
					</div>
				{/each}
			</div>

			<div class="more">
				<Button href="/shop" variant="outline">Browse everything</Button>
			</div>
		</div>
	</section>
{/if}

<style>
	.head {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 44ch;
		margin-bottom: 3.5rem;
	}

	.heading {
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.body {
		color: var(--color-muted);
	}

	/* 1 up below 600px, 2 up from 600px, 3 up from 900px (§8.5). */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem 2rem;
	}

	.more {
		display: flex;
		justify-content: center;
		margin-top: 3.5rem;
	}

	@media (width >= 37.5rem) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (width >= 56.25rem) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
