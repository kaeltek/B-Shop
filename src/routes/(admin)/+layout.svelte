<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { site } from '$lib/content/site';

	/** Admin chrome. Deliberately plain — this is a tool, not a shopfront. */
	let { data, children }: LayoutProps = $props();

	const NAV = [
		{ href: '/admin', label: 'Dashboard', exact: true },
		{ href: '/admin/products', label: 'Products' },
		{ href: '/admin/categories', label: 'Categories' },
		{ href: '/admin/settings', label: 'Settings' }
	];

	function isCurrent(href: string, exact = false): boolean {
		const path = page.url.pathname;
		return exact ? path === href : path === href || path.startsWith(`${href}/`);
	}
</script>

<div class="shell">
	<a href="#admin-main" class="skip-link">Skip to content</a>

	<header class="bar">
		<div class="bar-inner">
			<div class="brand-block">
				<a href="/admin" class="brand">{site.brandName}</a>
				<span class="tag">Admin</span>
			</div>

			<nav aria-label="Admin">
				<ul>
					{#each NAV as item (item.href)}
						<li>
							<a
								href={item.href}
								class:is-current={isCurrent(item.href, item.exact)}
								aria-current={isCurrent(item.href, item.exact) ? 'page' : undefined}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="account">
				<a href="/" class="view-site">View site</a>
				<span class="email">{data.user.email}</span>
				<!-- POST, so no prefetcher or third-party image can trigger it. -->
				<form method="POST" action="/logout">
					<button type="submit">Sign out</button>
				</form>
			</div>
		</div>
	</header>

	<main id="admin-main" tabindex="-1">
		{@render children()}
	</main>
</div>

<style>
	.shell {
		min-height: 100svh;
		background-color: var(--color-sand);
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 30;
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.bar-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 2rem;
		max-width: 84rem;
		margin-inline: auto;
		padding: 0.85rem 1.5rem;
	}

	.brand-block {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
	}

	.brand {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-cream);
		text-decoration: none;
	}

	.tag {
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.1rem 0.55rem;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	nav a {
		display: block;
		border-radius: var(--radius-pill);
		padding: 0.45rem 0.9rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: color-mix(in srgb, var(--color-cream) 76%, transparent);
		text-decoration: none;
		transition:
			background-color 200ms var(--ease-card),
			color 200ms var(--ease-card);
	}

	nav a:hover {
		color: var(--color-cream);
		background-color: rgb(247 242 233 / 0.1);
	}

	nav a.is-current {
		background-color: var(--color-cream);
		color: var(--color-ink);
	}

	.account {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.8125rem;
	}

	.view-site {
		color: var(--color-accent-soft);
		text-decoration: none;
	}

	.view-site:hover {
		color: var(--color-cream);
	}

	.email {
		color: color-mix(in srgb, var(--color-cream) 62%, transparent);
	}

	.account button {
		border: 1px solid rgb(247 242 233 / 0.28);
		border-radius: var(--radius-pill);
		background: none;
		padding: 0.35rem 0.9rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-cream);
		cursor: pointer;
	}

	.account button:hover {
		background-color: var(--color-cream);
		color: var(--color-ink);
	}

	main {
		max-width: 84rem;
		margin-inline: auto;
		padding: 2.5rem 1.5rem 5rem;
	}

	main:focus {
		outline: none;
	}

	/* The admin bar is dark, so the focus ring needs the light accent. */
	.bar {
		--focus-ring: var(--color-accent-soft);
	}
</style>
