<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { site } from '$lib/content/site';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ScrollToTop from '$lib/components/layout/ScrollToTop.svelte';

	/**
	 * Public site chrome.
	 *
	 * Nav items come from the typed content module for now. When categories
	 * land in P2 a `+layout.server.ts` here will merge the admin-managed
	 * category list into the `/shop` entry's children and pass the result
	 * down — `Header` and `Nav` already take items as a prop for exactly that.
	 */
	let { children }: { children: Snippet } = $props();

	// The homepage opens on a full-bleed hero, so the header overlays it until
	// the first scroll. Every other route starts solid.
	const transparentHeader = $derived(page.url.pathname === '/');
</script>

<a href="#main" class="skip-link">Skip to content</a>

<Header
	brandName={site.brandName}
	brandTagline={site.brandTagline}
	items={site.nav}
	contact={site.contact}
	social={site.social}
	transparent={transparentHeader}
/>

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
</style>
