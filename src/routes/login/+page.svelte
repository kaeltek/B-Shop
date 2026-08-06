<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { site } from '$lib/content/site';

	let { form }: PageProps = $props();

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? '/admin');
</script>

<svelte:head>
	<title>Sign in — {site.brandName}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="wrap">
	<div class="card">
		<a href="/" class="brand">{site.brandName}</a>
		<h1 class="heading display">Sign in</h1>
		<p class="sub">Admin access only.</p>

		<form method="POST">
			<input type="hidden" name="redirectTo" value={redirectTo} />

			<label for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="username"
				required
				value={form?.email ?? ''}
			/>

			<label for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>

			{#if form?.message}
				<p class="error" role="alert">{form.message}</p>
			{/if}

			<button type="submit">Sign in</button>
		</form>
	</div>
</main>

<style>
	.wrap {
		display: grid;
		place-items: center;
		min-height: 100svh;
		background-color: var(--color-sand);
		padding: 2rem 1.5rem;
	}

	.card {
		width: min(26rem, 100%);
		border-radius: var(--radius-organic);
		background-color: var(--color-cream);
		padding: clamp(2rem, 5vw, 3rem);
		box-shadow: 0 24px 60px -32px rgb(33 28 24 / 0.4);
	}

	.brand {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		text-decoration: none;
	}

	.heading {
		margin-top: 1.5rem;
		font-size: 2rem;
	}

	.sub {
		margin-top: 0.5rem;
		font-size: 0.9375rem;
	}

	form {
		display: flex;
		flex-direction: column;
		margin-top: 2rem;
	}

	label {
		margin-bottom: 0.4rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	input {
		margin-bottom: 1.25rem;
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-image);
		background-color: var(--color-cream);
		padding: 0.75rem 1rem;
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-ink);
	}

	button {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.85rem 1.75rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
		transition: background-color 250ms var(--ease-card);
	}

	button:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.error {
		margin-bottom: 1rem;
		border-radius: var(--radius-image);
		background-color: rgb(140 47 32 / 0.08);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #8c2f20;
	}
</style>
