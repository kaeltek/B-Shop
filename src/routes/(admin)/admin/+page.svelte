<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Dashboard — Admin</title></svelte:head>

<header class="head">
	<h1>Dashboard</h1>
	<p>Signed in as {data.user.email}</p>
</header>

<section class="gate" class:is-on={data.commerce.enabled}>
	<div>
		<p class="gate-label">Commerce</p>
		<p class="gate-state">
			{data.commerce.enabled ? 'On — the shop is live' : 'Off — catalogue mode'}
		</p>
		<p class="gate-note">
			{#if data.commerce.enabled}
				Prices, cart and checkout are all available to the public.
			{:else}
				Products are browsable but cannot be bought. Cart and checkout return 404.
			{/if}
		</p>
	</div>
	<a href="/admin/settings">Change</a>
</section>

<ul class="stats">
	<li><strong>{data.stats.total}</strong><span>Products</span></li>
	<li><strong>{data.stats.published}</strong><span>Published</span></li>
	<li><strong>{data.stats.drafts}</strong><span>Drafts</span></li>
	<li><strong>{data.stats.outOfStock}</strong><span>Sold out</span></li>
	<li><strong>{data.stats.categories}</strong><span>Categories</span></li>
</ul>

{#if data.stats.missingAltText > 0}
	<p class="warn">
		{data.stats.missingAltText}
		{data.stats.missingAltText === 1 ? 'product has an image' : 'products have images'} without alt text.
		<a href="/admin/products">Fix before publishing</a>.
	</p>
{/if}

{#if data.imageStore === 'local'}
	<p class="warn">
		<strong>IMAGE_STORE is <code>local</code>.</strong> Uploads are written to the filesystem, which
		works in development and on a host with a persistent disk. On Vercel they would appear to
		succeed and then vanish. Set <code>IMAGE_STORE=supabase</code> before deploying.
	</p>
{/if}

<nav class="links" aria-label="Shortcuts">
	<a href="/admin/products">Manage products</a>
	<a href="/admin/products/new">Add a product</a>
	<a href="/admin/categories">Manage categories</a>
</nav>

<style>
	.head {
		margin-bottom: 2rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.head p {
		margin-top: 0.4rem;
		font-size: 0.9375rem;
	}

	.gate {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-left: 4px solid var(--color-muted);
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.5rem 1.75rem;
	}

	.gate.is-on {
		border-left-color: var(--color-accent);
	}

	.gate-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.gate-state {
		margin-top: 0.3rem;
		font-family: var(--font-display);
		font-size: 1.375rem;
		color: var(--color-ink);
	}

	.gate-note {
		margin-top: 0.35rem;
		font-size: 0.875rem;
	}

	.gate a {
		border: 1px solid var(--color-ink);
		border-radius: var(--radius-pill);
		padding: 0.55rem 1.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
	}

	.gate a:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 1rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.stats li {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.25rem;
	}

	.stats strong {
		display: block;
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 500;
		color: var(--color-ink);
	}

	.stats span {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.warn {
		margin-top: 1.5rem;
		border-radius: var(--radius-card);
		background-color: rgb(192 138 62 / 0.16);
		padding: 1rem 1.25rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-ink);
	}

	.warn code {
		border-radius: 4px;
		background-color: rgb(33 28 24 / 0.08);
		padding: 0.05rem 0.35rem;
	}

	.warn a {
		color: var(--color-accent-strong);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.links a {
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.7rem 1.35rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
		text-decoration: none;
	}

	.links a:hover {
		background-color: var(--color-accent);
	}
</style>
