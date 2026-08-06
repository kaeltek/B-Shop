<script lang="ts">
	import type { PageProps } from './$types';
	import { site } from '$lib/content/site';
	import { home } from '$lib/content/home';

	import Hero from '$lib/components/home/Hero.svelte';
	import Intro from '$lib/components/home/Intro.svelte';
	import CounterStrip from '$lib/components/home/CounterStrip.svelte';
	import FeaturedProducts from '$lib/components/home/FeaturedProducts.svelte';
	import Features from '$lib/components/home/Features.svelte';
	import SupplierLogos from '$lib/components/home/SupplierLogos.svelte';
	import CateringCta from '$lib/components/home/CateringCta.svelte';
	import GallerySection from '$lib/components/home/GallerySection.svelte';
	import Newsletter from '$lib/components/home/Newsletter.svelte';
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import InstagramStrip from '$lib/components/home/InstagramStrip.svelte';

	/**
	 * Homepage — the fourteen sections of §8 in order. Header (1), footer (13)
	 * and scroll-to-top (14) come from the `(site)` layout.
	 *
	 * Every section takes its content as a prop. None of them import the content
	 * module, so moving this copy into Postgres later is a change to the load
	 * function and nothing else.
	 */
	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{site.brandName} — {site.brandTagline}</title>
	<meta name="description" content={site.footerBlurb} />
</svelte:head>

<Hero slides={home.hero} />

<Intro content={home.intro} />

<CounterStrip counters={home.counters} />

<FeaturedProducts intro={home.featured} products={data.featured} commerce={data.commerce} />

<Features content={home.features} />

<SupplierLogos suppliers={home.suppliers} />

<CateringCta content={home.catering} />

<GallerySection intro={home.gallery} items={home.gallery.items} />

<Newsletter content={home.newsletter} result={form} />

<ContactSection contact={site.contact} />

<InstagramStrip content={home.instagram} />
