<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import MobileDrawer from '$lib/components/layout/MobileDrawer.svelte';
	import type { ContactDetails, NavLink, SocialLink } from '$lib/types/content';

	/**
	 * Sticky site header (§8.1). Transparent over the hero, solid cream once the
	 * page scrolls.
	 *
	 * Two affordances are deliberately absent until their phase lands, rather
	 * than being rendered dead:
	 *   - `onsearch`  — search overlay arrives with the shop index (P3).
	 *   - `commerce`  — cart cluster arrives with the gate (P4). Nothing here
	 *     may render a buy affordance without the server-side guard behind it.
	 */
	interface Props {
		brandName: string;
		brandTagline: string;
		items: NavLink[];
		contact: ContactDetails;
		social: SocialLink[];
		/** Overlay the header on a hero until the user scrolls. */
		transparent?: boolean;
		onsearch?: () => void;
		commerce?: { enabled: boolean; count: number; subtotal: string };
	}

	let {
		brandName,
		brandTagline,
		items,
		contact,
		social,
		transparent = false,
		onsearch,
		commerce
	}: Props = $props();

	let scrolled = $state(false);
	let drawerOpen = $state(false);

	const solid = $derived(!transparent || scrolled);

	$effect(() => {
		const onScroll = () => {
			scrolled = window.scrollY > 24;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header class="header" class:is-solid={solid}>
	<div class="header-inner container-page">
		<a href="/" class="brand">
			<span class="brand-name">{brandName}</span>
			<span class="brand-tagline">{brandTagline}</span>
		</a>

		<div class="header-nav">
			<Nav {items} />
		</div>

		<div class="header-actions">
			{#if onsearch}
				<button type="button" class="icon-button" onclick={onsearch}>
					<Icon name="search" />
					<span class="sr-only">Search</span>
				</button>
			{/if}

			<a href="/login" class="icon-button">
				<Icon name="user" />
				<span class="sr-only">Account</span>
			</a>

			{#if commerce?.enabled}
				<a href="/cart" class="cart">
					<span class="cart-icon">
						<Icon name="bag" />
						{#if commerce.count > 0}
							<span class="cart-count">{commerce.count}</span>
						{/if}
					</span>
					<span class="cart-subtotal">{commerce.subtotal}</span>
					<span class="sr-only">items in cart</span>
				</a>
			{/if}

			<button
				type="button"
				class="icon-button burger"
				aria-expanded={drawerOpen}
				onclick={() => (drawerOpen = true)}
			>
				<Icon name="menu" size={22} />
				<span class="sr-only">Open menu</span>
			</button>
		</div>
	</div>
</header>

<MobileDrawer open={drawerOpen} {items} {contact} {social} onclose={() => (drawerOpen = false)} />

<style>
	.header {
		/* Fixed rather than sticky: while transparent it must overlay the hero
		   image, which an in-flow header cannot do. `(site)` offsets `main` by
		   `--header-h` to compensate. */
		position: fixed;
		inset-inline: 0;
		top: 0;
		z-index: 50;
		min-height: var(--header-h);
		--nav-fg: var(--color-cream);
		color: var(--color-cream);
		transition:
			background-color 350ms var(--ease-card),
			box-shadow 350ms var(--ease-card),
			color 350ms var(--ease-card);
	}

	.header.is-solid {
		--nav-fg: var(--color-ink);
		background-color: var(--color-cream);
		color: var(--color-ink);
		box-shadow: 0 1px 0 rgb(33 28 24 / 0.08);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding-block: 1rem;
	}

	.brand {
		display: flex;
		flex-direction: column;
		color: inherit;
		text-decoration: none;
		line-height: 1.1;
	}

	.brand-name {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.brand-tagline {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	/* Centred nav (§8.1) — hidden below the drawer breakpoint. */
	.header-nav {
		display: none;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: inherit;
		cursor: pointer;
		transition: background-color 200ms var(--ease-card);
	}

	.icon-button:hover {
		background-color: rgb(192 138 62 / 0.18);
	}

	.cart {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding-inline: 0.5rem;
		color: inherit;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.cart-icon {
		position: relative;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
	}

	.cart-count {
		position: absolute;
		top: 0.25rem;
		right: 0.15rem;
		display: grid;
		place-items: center;
		min-width: 1.15rem;
		height: 1.15rem;
		padding-inline: 0.25rem;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		color: var(--color-ink);
		font-size: 0.6875rem;
		line-height: 1;
	}

	.cart-subtotal {
		display: none;
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

	@media (width >= 64rem) {
		.header-nav {
			display: block;
		}

		.burger {
			display: none;
		}

		.cart-subtotal {
			display: inline;
		}
	}
</style>
