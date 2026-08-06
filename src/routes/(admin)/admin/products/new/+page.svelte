<script lang="ts">
	import type { PageProps } from './$types';
	import ProductFields from '$lib/components/admin/ProductFields.svelte';

	let { data, form }: PageProps = $props();

	const values = $derived({
		name: form?.values?.name ?? '',
		slug: form?.values?.slug ?? '',
		summary: form?.values?.summary ?? '',
		description: form?.values?.description ?? '',
		price: form?.values?.priceCents ? String(form.values.priceCents / 100) : '',
		currency: form?.values?.currency ?? 'EUR',
		categoryId: form?.values?.categoryId ?? '',
		tags: form?.values?.tags ?? '',
		isPublished: false,
		isAvailable: form?.values?.isAvailable ?? true,
		sortOrder: form?.values?.sortOrder ?? 0
	});
</script>

<svelte:head><title>New product — Admin</title></svelte:head>

<nav class="crumbs"><a href="/admin/products">Products</a> <span>/</span> <span>New</span></nav>

<h1>Add a product</h1>

<form method="POST" class="panel">
	{#if form?.errors?.form}
		<p class="error-banner" role="alert">{form.errors.form}</p>
	{/if}

	<ProductFields
		{values}
		categories={data.categories}
		errors={form?.errors ?? {}}
		allowPublish={false}
		publishHint="Saved as a draft. Add images and alt text on the next screen, then publish."
	/>

	<div class="actions">
		<button type="submit">Create product</button>
		<a href="/admin/products">Cancel</a>
	</div>
</form>

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

	h1 {
		font-family: var(--font-display);
		font-size: 2rem;
		margin-bottom: 1.5rem;
	}

	.panel {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.75rem;
		max-width: 60rem;
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

	button:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
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
</style>
