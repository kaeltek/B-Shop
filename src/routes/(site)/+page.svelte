<script lang="ts">
	import type { PageProps } from './$types';
	import { site } from '$lib/content/site';
	import { home } from '$lib/content/home';
	import { homeGalleryImages } from '$lib/content/gallery';

	import Hero from '$lib/components/home/Hero.svelte';
	import Intro from '$lib/components/home/Intro.svelte';
	import CounterStrip from '$lib/components/home/CounterStrip.svelte';
	import FeaturedProducts from '$lib/components/home/FeaturedProducts.svelte';
	import Features from '$lib/components/home/Features.svelte';
	import SupplierLogos from '$lib/components/home/SupplierLogos.svelte';
	import CateringCta from '$lib/components/home/CateringCta.svelte';
	import GallerySection from '$lib/components/home/GallerySection.svelte';
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import InstagramStrip from '$lib/components/home/InstagramStrip.svelte';

	/**
	 * Homepage — the sections of §8 in order. Header, footer and scroll-to-top
	 * come from the `(site)` layout.
	 *
	 * Every section takes its content as a prop. None of them import the content
	 * module, so moving this copy into Postgres later is a change to the load
	 * function and nothing else.
	 */
	let { data }: PageProps = $props();
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

<GallerySection intro={home.gallery} images={homeGalleryImages} />

<ContactSection contact={site.contact} surface="sand" />

<InstagramStrip content={home.instagram} tiles={data.packagingTiles} />
