<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import ProductFields from '$lib/components/admin/ProductFields.svelte';
	import ImageManager from '$lib/components/admin/ImageManager.svelte';

	let { data, form }: PageProps = $props();

	let saving = $state(false);

	const product = $derived(data.product);

	const values = $derived({
		name: product.name,
		slug: product.slug,
		summary: product.summary ?? '',
		description: product.description ?? '',
		price: (product.priceCents / 100).toFixed(2),
		currency: product.currency,
		categoryId: product.categoryId ?? '',
		tags: product.tags.join(', '),
		isPublished: product.isPublished,
		isAvailable: product.isAvailable,
		sortOrder: product.sortOrder
	});

	const missingAlt = $derived(product.images.some((image) => image.altText.trim() === ''));
</script>

<svelte:head><title>{product.name} — Admin</title></svelte:head>

<nav class="crumbs">
	<a href="/admin/products">Products</a> <span>/</span> <span>{product.name}</span>
</nav>

<header class="head">
	<h1>{product.name}</h1>
	<div class="head-actions">
		{#if product.isPublished}
			<a class="view" href="/shop/{product.slug}" target="_blank" rel="noopener">View on site ↗</a>
		{:else}
			<span class="pill">Draft</span>
		{/if}
	</div>
</header>

{#if data.justCreated}
	<p class="note">Created as a draft. Add images and alt text, then publish.</p>
{/if}

{#if form?.message}
	<p class="note" class:is-error={form.ok === false} role="status">{form.message}</p>
{/if}

{#if missingAlt}
	<p class="note is-warn">
		One or more images have no alt text. That is required before this product can be published.
	</p>
{/if}

<div class="layout">
	<form
		method="POST"
		action="?/save"
		class="panel"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}
	>
		<h2>Details</h2>

		{#if form?.errors?.form}
			<p class="error-banner" role="alert">{form.errors.form}</p>
		{/if}

		<ProductFields {values} categories={data.categories} errors={form?.errors ?? {}} />

		<div class="actions">
			<button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
			<a href="/admin/products">Back to products</a>
		</div>
	</form>

	<ImageManager images={product.images} busy={saving} />
</div>

<style>
	.crumbs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-muted);
	}

	.crumbs a {
		color: var(--color-accent-strong);
		text-decoration: none;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.view {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-accent-strong);
		text-decoration: none;
	}

	.pill {
		border-radius: var(--radius-pill);
		background-color: rgb(33 28 24 / 0.08);
		padding: 0.2rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.note {
		margin-bottom: 1rem;
		border-radius: var(--radius-image);
		background-color: rgb(133 90 32 / 0.12);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: var(--color-accent-strong);
	}

	.note.is-warn {
		background-color: rgb(192 138 62 / 0.2);
		color: var(--color-ink);
	}

	.note.is-error {
		background-color: rgb(140 47 32 / 0.1);
		color: #8c2f20;
	}

	.layout {
		display: grid;
		gap: 1.5rem;
		align-items: start;
	}

	.panel {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.75rem;
	}

	.panel h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		border-top: 1px solid rgb(33 28 24 / 0.1);
		margin-top: 1.5rem;
		padding-top: 1.5rem;
	}

	button {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.8rem 1.6rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.actions a {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.error-banner {
		margin-bottom: 1.25rem;
		border-radius: var(--radius-image);
		background-color: rgb(140 47 32 / 0.1);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #8c2f20;
	}

	@media (width >= 72rem) {
		.layout {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
