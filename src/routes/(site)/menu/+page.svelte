<script lang="ts">
	import type { PageProps } from './$types';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { menuPage } from '$lib/content/pages';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Menu — {menuPage.intro.title}</title>
	<meta name="description" content={menuPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<DecorativeAccent mark="fennel" position="top-right" size={210} rotate={-15} opacity={0.1} />
	<div class="container-page">
		<Eyebrow text={menuPage.intro.eyebrow} />
		<h1 class="title display">{menuPage.intro.title}</h1>
		<p class="standfirst">{menuPage.intro.standfirst}</p>
	</div>
</header>

<div class="menu container-page">
	{#if data.groups.length === 0}
		<p class="empty">The menu is being rewritten. Check back shortly.</p>
	{:else}
		{#each data.groups as group (group.category?.id ?? 'uncategorised')}
			<section class="group" use:reveal={{ stagger: 50 }}>
				<header class="group-head reveal">
					<h2 class="group-title display">{group.category?.name ?? 'Also available'}</h2>
					{#if group.category?.description}
						<p class="group-note">{group.category.description}</p>
					{/if}
				</header>

				<ul class="items">
					{#each group.products as product (product.id)}
						<li class="item reveal" class:is-out={!product.isAvailable}>
							<div class="item-main">
								<h3>
									<a href="/shop/{product.slug}">{product.name}</a>
									{#if !product.isAvailable}
										<span class="out">Sold out</span>
									{/if}
								</h3>
								{#if product.summary}
									<p>{product.summary}</p>
								{/if}
							</div>

							<div class="leader" aria-hidden="true"></div>

							<Price
								cents={product.priceCents}
								currency={product.currency}
								commerce={data.commerce}
								size="sm"
								class="item-price"
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</div>

<div class="tail"></div>

<style>
	.head {
		position: relative;
		overflow: hidden;
		padding-bottom: 2rem;
	}

	.title {
		margin-top: 1rem;
		max-width: 20ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.5rem;
		max-width: 58ch;
		font-size: 1.125rem;
	}

	.menu {
		display: grid;
		gap: 4rem;
		max-width: 56rem;
	}

	.group-head {
		border-bottom: 1px solid rgb(33 28 24 / 0.14);
		padding-bottom: 1rem;
		margin-bottom: 1.75rem;
	}

	.group-title {
		font-size: clamp(1.75rem, 3vw, 2.25rem);
	}

	.group-note {
		margin-top: 0.5rem;
		font-size: 0.9375rem;
		color: var(--color-muted);
	}

	.items {
		display: grid;
		gap: 1.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		gap: 0.5rem 1rem;
	}

	.item h3 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
		font-size: 1.125rem;
		font-family: var(--font-display);
	}

	.item h3 a {
		color: inherit;
		text-decoration: none;
	}

	.item h3 a:hover {
		color: var(--color-accent-strong);
	}

	.item p {
		margin-top: 0.35rem;
		font-size: 0.9375rem;
		max-width: 52ch;
	}

	.out {
		border-radius: var(--radius-pill);
		background-color: var(--color-sand);
		padding: 0.15rem 0.6rem;
		font-family: var(--font-body);
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.is-out .item-main {
		opacity: 0.65;
	}

	/* Classic menu leader dots, drawn rather than typed so they never wrap. */
	.leader {
		display: none;
		border-bottom: 1px dotted rgb(33 28 24 / 0.3);
		translate: 0 -0.3rem;
	}

	.empty {
		margin-block: 3rem;
	}

	.tail {
		height: clamp(5rem, 10vw, 9rem);
	}

	@media (width >= 40rem) {
		.item {
			grid-template-columns: auto 1fr auto;
		}

		.leader {
			display: block;
		}
	}
</style>
