<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatPrice } from '$lib/utils/money';
	import type { Product } from '$lib/types/catalogue';

	let { data, form }: PageProps = $props();

	let selected = $state<string[]>([]);
	let dragIndex = $state<number | null>(null);

	/**
	 * Optimistic order as ids; null means "whatever the server says".
	 *
	 * An override rather than a copy, so any change to the underlying set — a
	 * search narrowing the list, a delete, a saved reorder — discards it and
	 * server data wins, with no effect needed to keep the two in step.
	 */
	let overrideOrder = $state<string[] | null>(null);

	const rows = $derived.by(() => {
		if (!overrideOrder) return data.products;

		const byId = new Map(data.products.map((product) => [product.id, product]));
		const ordered = overrideOrder
			.map((id) => byId.get(id))
			.filter((product): product is Product => product !== undefined);

		return ordered.length === data.products.length ? ordered : data.products;
	});

	const order = $derived(rows.map((row) => row.id).join(','));
	const dirty = $derived(order !== data.products.map((p) => p.id).join(','));

	function move(from: number, to: number) {
		if (to < 0 || to >= rows.length) return;
		const next = [...rows];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		overrideOrder = next.map((row) => row.id);
	}

	function categoryName(id: string | null): string {
		return data.categories.find((category) => category.id === id)?.name ?? '—';
	}

	function toggle(id: string, checked: boolean) {
		selected = checked ? [...selected, id] : selected.filter((value) => value !== id);
	}

	const needsAlt = (product: Product) =>
		product.images.some((image) => image.altText.trim() === '');
</script>

<svelte:head><title>Products — Admin</title></svelte:head>

<header class="head">
	<div>
		<h1>Products</h1>
		<p>{data.products.length} shown{data.query ? ` for “${data.query}”` : ''}</p>
	</div>
	<a class="primary" href="/admin/products/new">Add product</a>
</header>

<div class="toolbar">
	<form method="GET" class="search">
		<label class="sr-only" for="q">Search products</label>
		<input
			id="q"
			name="q"
			type="search"
			placeholder="Search name, slug or tag"
			value={data.query}
		/>
		<button type="submit">Search</button>
		{#if data.query}<a href="/admin/products" class="clear">Clear</a>{/if}
	</form>

	{#if dirty}
		<form method="POST" action="?/reorder" use:enhance class="reorder">
			<input type="hidden" name="order" value={order} />
			<button type="submit">Save order</button>
			<button type="button" class="ghost" onclick={() => (overrideOrder = null)}> Discard </button>
		</form>
	{/if}
</div>

{#if form?.message}
	<p class="result" class:is-error={!form.ok} role="status">{form.message}</p>
{/if}

<form method="POST" action="?/bulk" use:enhance>
	<div class="bulk" class:is-active={selected.length > 0}>
		<span>{selected.length} selected</span>
		<button type="submit" name="intent" value="publish" disabled={selected.length === 0}>
			Publish
		</button>
		<button type="submit" name="intent" value="unpublish" disabled={selected.length === 0}>
			Unpublish
		</button>
	</div>

	{#if rows.length === 0}
		<p class="empty">No products match. <a href="/admin/products">Show all</a>.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th class="tick"><span class="sr-only">Select</span></th>
					<th class="move"><span class="sr-only">Reorder</span></th>
					<th>Name</th>
					<th>Category</th>
					<th>Price</th>
					<th>Status</th>
					<th><span class="sr-only">Actions</span></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as product, i (product.id)}
					<tr
						draggable="true"
						class:is-dragging={dragIndex === i}
						ondragstart={() => (dragIndex = i)}
						ondragend={() => (dragIndex = null)}
						ondragover={(e) => e.preventDefault()}
						ondrop={(e) => {
							e.preventDefault();
							if (dragIndex !== null) move(dragIndex, i);
							dragIndex = null;
						}}
					>
						<td class="tick">
							<input
								type="checkbox"
								name="selected"
								value={product.id}
								checked={selected.includes(product.id)}
								onchange={(e) => toggle(product.id, e.currentTarget.checked)}
								aria-label="Select {product.name}"
							/>
						</td>

						<td class="move">
							<!-- Buttons as well as drag: drag-and-drop alone is unusable
							     by keyboard, and §10 requires the admin to be traversable. -->
							<button type="button" onclick={() => move(i, i - 1)} disabled={i === 0}>
								<span aria-hidden="true">↑</span>
								<span class="sr-only">Move {product.name} up</span>
							</button>
							<button type="button" onclick={() => move(i, i + 1)} disabled={i === rows.length - 1}>
								<span aria-hidden="true">↓</span>
								<span class="sr-only">Move {product.name} down</span>
							</button>
						</td>

						<td>
							<a class="name" href="/admin/products/{product.id}">{product.name}</a>
							<span class="slug">/{product.slug}</span>
						</td>

						<td>{categoryName(product.categoryId)}</td>
						<td>{formatPrice(product.priceCents, product.currency)}</td>

						<td>
							{#if product.isPublished}
								<span class="pill is-live">Published</span>
							{:else}
								<span class="pill">Draft</span>
							{/if}
							{#if !product.isAvailable}<span class="pill is-out">Sold out</span>{/if}
							{#if needsAlt(product)}<span class="pill is-warn">Needs alt text</span>{/if}
						</td>

						<td class="actions">
							<a href="/admin/products/{product.id}">Edit</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</form>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.head p {
		margin-top: 0.3rem;
		font-size: 0.875rem;
	}

	.primary {
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.7rem 1.4rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
	}

	.primary:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.search,
	.reorder {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	input[type='search'] {
		width: min(22rem, 60vw);
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.55rem 1rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
	}

	button,
	.clear {
		border: 1px solid rgb(33 28 24 / 0.2);
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.55rem 1.1rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
		text-decoration: none;
		cursor: pointer;
	}

	button:hover:not(:disabled),
	.clear:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.reorder button[type='submit'] {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.bulk {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.6rem 1rem;
		font-size: 0.8125rem;
		opacity: 0.5;
		transition: opacity 200ms var(--ease-card);
	}

	.bulk.is-active {
		opacity: 1;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border-radius: var(--radius-card);
		overflow: hidden;
		background-color: var(--color-cream);
		font-size: 0.875rem;
	}

	th,
	td {
		padding: 0.75rem 0.85rem;
		text-align: left;
		vertical-align: middle;
	}

	thead th {
		background-color: rgb(33 28 24 / 0.05);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	tbody tr {
		border-top: 1px solid rgb(33 28 24 / 0.08);
		cursor: grab;
	}

	tbody tr.is-dragging {
		opacity: 0.4;
	}

	.tick,
	.move {
		width: 1%;
		white-space: nowrap;
	}

	.move button {
		padding: 0.2rem 0.45rem;
		font-size: 0.75rem;
	}

	.name {
		font-weight: 600;
		color: var(--color-ink);
		text-decoration: none;
	}

	.name:hover {
		color: var(--color-accent-strong);
	}

	.slug {
		display: block;
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.pill {
		display: inline-block;
		border-radius: var(--radius-pill);
		background-color: rgb(33 28 24 / 0.08);
		padding: 0.15rem 0.6rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.pill.is-live {
		background-color: rgb(58 61 46 / 0.14);
		color: var(--color-olive);
	}

	.pill.is-out {
		background-color: rgb(140 47 32 / 0.12);
		color: #8c2f20;
	}

	.pill.is-warn {
		background-color: rgb(192 138 62 / 0.22);
		color: var(--color-accent-strong);
	}

	.actions a {
		color: var(--color-accent-strong);
		font-weight: 600;
	}

	.result {
		margin-bottom: 1rem;
		border-radius: var(--radius-image);
		background-color: rgb(133 90 32 / 0.12);
		padding: 0.7rem 1rem;
		font-size: 0.875rem;
		color: var(--color-accent-strong);
	}

	.result.is-error {
		background-color: rgb(140 47 32 / 0.1);
		color: #8c2f20;
	}

	.empty {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 2.5rem;
		text-align: center;
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
</style>
