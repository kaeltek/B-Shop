<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import PlaceholderImage from '$lib/components/ui/PlaceholderImage.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import CounterStrip from '$lib/components/home/CounterStrip.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { aboutPage } from '$lib/content/pages';
	import { home } from '$lib/content/home';
</script>

<svelte:head>
	<title>Our story — {aboutPage.intro.title}</title>
	<meta name="description" content={aboutPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<DecorativeAccent mark="sprig" position="top-right" size={220} rotate={20} opacity={0.1} />
	<div class="container-page">
		<Eyebrow text={aboutPage.intro.eyebrow} />
		<h1 class="title display">{aboutPage.intro.title}</h1>
		<p class="standfirst">{aboutPage.intro.standfirst}</p>
	</div>
</header>

<figure class="banner">
	<PlaceholderImage seed="about-banner" alt="The dining room seen from the kitchen pass" />
</figure>

<section class="section-y">
	<div class="container-page prose" use:reveal={{ stagger: 80 }}>
		{#each aboutPage.body as block (block.heading)}
			<article class="block reveal">
				<h2 class="block-heading display">{block.heading}</h2>
				<p>{block.text}</p>
			</article>
		{/each}
	</div>
</section>

<CounterStrip counters={home.counters} />

<section class="section-y">
	<div class="container-page">
		<Eyebrow text="How we work" />
		<h2 class="values-title display">Four things we do not bend on</h2>

		<ul class="values" use:reveal={{ stagger: 60 }}>
			{#each aboutPage.values as value (value.title)}
				<li class="reveal">
					<h3>{value.title}</h3>
					<p>{value.text}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head {
		position: relative;
		overflow: hidden;
		padding-bottom: 3rem;
	}

	.title {
		margin-top: 1rem;
		max-width: 20ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.5rem;
		max-width: 58ch;
		font-size: 1.25rem;
	}

	.banner {
		margin: 0;
		aspect-ratio: 21 / 9;
		overflow: hidden;
	}

	.banner :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.prose {
		display: grid;
		gap: 3rem;
		max-width: 62rem;
	}

	.block-heading {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		margin-bottom: 0.85rem;
	}

	.block p {
		max-width: 68ch;
	}

	.values-title {
		margin-top: 0.75rem;
		margin-bottom: 3rem;
		font-size: clamp(2rem, 4vw, 3rem);
	}

	.values {
		display: grid;
		gap: 2.5rem 2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.values h3 {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
		margin-bottom: 0.6rem;
	}

	.values p {
		font-size: 0.9375rem;
	}

	@media (width >= 48rem) {
		.prose {
			grid-template-columns: repeat(3, 1fr);
		}

		.values {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
