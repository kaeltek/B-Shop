<script lang="ts">
	import { page } from '$app/state';

	/**
	 * Error page.
	 *
	 * Matters more than usual here: while the site is gated, every commerce URL
	 * answers 404, and those 404s should look like a considered part of the site
	 * rather than a crash. No mention of a shop being switched off — that is
	 * exactly what §3.3 does not want advertised.
	 */
	const isNotFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{isNotFound ? 'Page not found' : 'Something went wrong'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="wrap">
	<div class="inner">
		<p class="code">{page.status}</p>
		<h1 class="heading display">
			{isNotFound ? 'That page is not here' : 'Something went wrong'}
		</h1>
		<p class="body">
			{#if isNotFound}
				The link may be old, or the page may have moved. The shop and the menu are both still where
				you left them.
			{:else}
				{page.error?.message ?? 'An unexpected error occurred. Please try again.'}
			{/if}
		</p>

		<div class="actions">
			<a class="btn" href="/">Back to the homepage</a>
			<a class="btn ghost" href="/shop">Browse the shop</a>
		</div>
	</div>
</main>

<style>
	.wrap {
		display: grid;
		place-items: center;
		min-height: 100svh;
		background-color: var(--color-cream);
		padding: 2rem 1.5rem;
	}

	.inner {
		max-width: 34rem;
		text-align: center;
	}

	.code {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	.heading {
		margin-top: 1rem;
		font-size: clamp(2.25rem, 5vw, 3.5rem);
	}

	.body {
		margin-top: 1.25rem;
		color: var(--color-muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 2.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.85rem 1.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
		transition:
			background-color 250ms var(--ease-card),
			color 250ms var(--ease-card);
	}

	.btn:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.ghost {
		background: none;
		border-color: rgb(33 28 24 / 0.25);
		color: var(--color-ink);
	}

	.ghost:hover {
		background-color: var(--color-ink);
		border-color: var(--color-ink);
	}
</style>
