<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import { site } from '$lib/content/site';
	import { contactPage } from '$lib/content/pages';
</script>

<svelte:head>
	<title>Contact — {contactPage.intro.title}</title>
	<meta name="description" content={contactPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<DecorativeAccent mark="citrus" position="top-right" size={200} opacity={0.09} />
	<div class="container-page">
		<Eyebrow text={contactPage.intro.eyebrow} />
		<h1 class="title display">{contactPage.intro.title}</h1>
		<p class="standfirst">{contactPage.intro.standfirst}</p>
	</div>
</header>

<ContactSection
	contact={site.contact}
	eyebrow="Details"
	heading="Everything you need to reach us"
	body="The quickest way to book an evening table is to call between nine and five. For anything that needs thinking about — catering, a private room, a big group — email is better, and you will get a proper answer rather than a rushed one."
/>

<style>
	.head {
		position: relative;
		overflow: hidden;
		padding-bottom: 0;
	}

	.title {
		margin-top: 1rem;
		max-width: 18ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.5rem;
		max-width: 58ch;
		font-size: 1.125rem;
	}
</style>
