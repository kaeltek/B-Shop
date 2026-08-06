<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { site } from '$lib/content/site';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ScrollToTop from '$lib/components/layout/ScrollToTop.svelte';

	/**
	 * Public site chrome.
	 *
	 * Nav arrives from `+layout.server.ts` with admin-managed categories already
	 * merged into the `/shop` entry, so neither this file nor `Nav` knows where
	 * any of it came from.
	 */
	let { data, children }: LayoutProps = $props();

	// The homepage opens on a full-bleed hero, so the header overlays it until
	// the first scroll. Every other route starts solid.
	const transparentHeader = $derived(page.url.pathname === '/');
</script>

<a href="#main" class="skip-link">Skip to content</a>

<Header
	brandName={site.brandName}
	brandTagline={site.brandTagline}
	items={data.nav}
	contact={site.contact}
	social={site.social}
	transparent={transparentHeader}
	commerce={{ enabled: data.commerce.enabled }}
/>

{#if !data.commerce.enabled && data.commerce.notice}
	<!-- Optional gated-mode banner (§3.1). Not an error and not an apology —
	     it only appears when an admin has written copy for it. -->
	<p class="notice">{data.commerce.notice}</p>
{/if}

<main id="main" tabindex="-1">
	{@render children()}
</main>

<Footer
	brandName={site.brandName}
	blurb={site.footerBlurb}
	columns={site.footerColumns}
	social={site.social}
	contact={site.contact}
/>

<ScrollToTop />

<style>
	/* Clears the fixed header. A full-bleed hero opts back out with
	   `margin-top: calc(-1 * var(--header-h))` so it can run under the
	   transparent header. */
	main {
		padding-top: var(--header-h);
	}

	/* `tabindex="-1"` makes the skip link work; it must not draw a ring. */
	main:focus {
		outline: none;
	}

	.notice {
		position: relative;
		z-index: 40;
		margin-top: var(--header-h);
		background-color: var(--color-sand);
		padding: 0.85rem 1.5rem;
		text-align: center;
		font-size: 0.9375rem;
		color: var(--color-ink);
	}

	/* When the banner is present it already accounts for the header. */
	.notice + main {
		padding-top: 0;
	}
</style>
