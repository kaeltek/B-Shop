<script lang="ts">
	import type { PageProps } from './$types';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { menuPage } from '$lib/content/pages';

	/**
	 * Shop index — full catalogue with filters and sort (§6).
	 *
	 * Filters are plain links and the sort is a GET form, so the whole page
	 * works without JavaScript, every filtered view has a shareable URL, and the
	 * back button behaves.
	 */
	let { data }: PageProps = $props();

	const { category, tag, sort } = $derived(data.filters);

	/**
	 * Builds a filter URL, dropping empty params so URLs stay clean and the
	 * default view is plain `/shop`.
	 *
	 * Assembled by hand rather than with URLSearchParams: this is a throwaway
	 * string, but the linter cannot tell that from reactive state and flags
	 * every mutable instance of the built-in.
	 */
	function href(patch: { category?: string | null; tag?: string | null; sort?: string | null }) {
		const next = {
			category: patch.category !== undefined ? patch.category : category,
			tag: patch.tag !== undefined ? patch.tag : tag,
			sort: patch.sort !== undefined ? patch.sort : sort
		};

		const parts: string[] = [];
		if (next.category) parts.push(`category=${encodeURIComponent(next.category)}`);
		if (next.tag) parts.push(`tag=${encodeURIComponent(next.tag)}`);
		if (next.sort && next.sort !== 'curated') parts.push(`sort=${encodeURIComponent(next.sort)}`);

		return parts.length > 0 ? `/shop?${parts.join('&')}` : '/shop';
	}

	const SORT_OPTIONS = [
		{ value: 'curated', label: 'Featured' },
		{ value: 'newest', label: 'Newest' },
		{ value: 'name', label: 'A – Z' },
		{ value: 'price-asc', label: 'Price: low to high' },
		{ value: 'price-desc', label: 'Price: high to low' }
	];
</script>

<svelte:head>
	<title>Shop — everything we sell to take home</title>
	<meta name="description" content={menuPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<div class="container-page">
		<Eyebrow text="The shop" />
		<h1 class="title display">Everything we sell to take home</h1>
		<p class="standfirst">{menuPage.intro.standfirst}</p>
	</div>
</header>

<div class="container-page">
	<div class="filters">
		<nav class="chips" aria-label="Filter by category">
			<a href={href({ category: null })} class="chip" class:is-on={!category}>All</a>
			{#each data.categories as item (item.id)}
				<a
					href={href({ category: item.slug })}
					class="chip"
					class:is-on={category === item.slug}
					aria-current={category === item.slug ? 'page' : undefined}
				>
					{item.name}
				</a>
			{/each}
		</nav>

		<form method="GET" action="/shop" class="sort">
			{#if category}<input type="hidden" name="category" value={category} />{/if}
			{#if tag}<input type="hidden" name="tag" value={tag} />{/if}

			<label for="sort">Sort</label>
			<select id="sort" name="sort" value={sort} onchange={(e) => e.currentTarget.form?.submit()}>
				{#each SORT_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<!-- Submits on change with JS; this is the fallback without it. -->
			<noscript><button type="submit">Apply</button></noscript>
		</form>
	</div>

	{#if data.tags.length > 0}
		<nav class="chips tags" aria-label="Filter by tag">
			<a href={href({ tag: null })} class="chip small" class:is-on={!tag}>Any tag</a>
			{#each data.tags as item (item)}
				<a
					href={href({ tag: item })}
					class="chip small"
					class:is-on={tag === item}
					aria-current={tag === item ? 'page' : undefined}
				>
					{item}
				</a>
			{/each}
		</nav>
	{/if}

	{#if data.products.length === 0}
		<p class="empty">
			Nothing here yet under these filters. <a href="/shop">Show everything</a>.
		</p>
	{:else}
		<p class="count" aria-live="polite">
			{data.products.length}
			{data.products.length === 1 ? 'item' : 'items'}
		</p>

		<div class="grid" use:reveal={{ stagger: 60 }}>
			{#each data.products as product, i (product.id)}
				<div class="reveal">
					<ProductCard {product} commerce={data.commerce} eager={i < 3} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<div class="tail"></div>

<style>
	.head {
		padding-bottom: 2.5rem;
	}

	.title {
		margin-top: 1rem;
		max-width: 18ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.25rem;
		max-width: 56ch;
		font-size: 1.125rem;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		border-block: 1px solid rgb(33 28 24 / 0.1);
		padding-block: 1.25rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tags {
		padding-top: 1.25rem;
	}

	.chip {
		border: 1px solid rgb(33 28 24 / 0.16);
		border-radius: var(--radius-pill);
		padding: 0.5rem 1.1rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
		transition:
			background-color 200ms var(--ease-card),
			border-color 200ms var(--ease-card),
			color 200ms var(--ease-card);
	}

	.chip.small {
		font-size: 0.6875rem;
		padding: 0.35rem 0.85rem;
		text-transform: lowercase;
		letter-spacing: 0.04em;
	}

	.chip:hover {
		border-color: var(--color-accent);
	}

	.chip.is-on {
		background-color: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-cream);
	}

	.sort {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.8125rem;
	}

	.sort label {
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.sort select {
		border: 1px solid rgb(33 28 24 / 0.16);
		border-radius: var(--radius-pill);
		background-color: transparent;
		padding: 0.5rem 1rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-ink);
	}

	.count {
		margin-top: 2rem;
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem 2rem;
		margin-top: 1.5rem;
	}

	.empty {
		margin-block: 4rem;
		text-align: center;
	}

	.empty a {
		color: var(--accent-text);
	}

	.tail {
		height: clamp(5rem, 10vw, 9rem);
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
