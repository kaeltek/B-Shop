<script lang="ts">
	import { site } from '$lib/content/site';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * P1 homepage: foundation only.
	 *
	 * The fourteen homepage sections in §8 (hero slider, counters, featured
	 * product grid, gallery, newsletter, Instagram strip …) are P3 work and
	 * need the P2 data layer behind them first. What is here exercises the
	 * pieces P1 owns — hero-height layout under a transparent header, the
	 * eyebrow device, the reveal utility, the type scale — using only copy that
	 * already exists in the typed content module. No new copy is hardcoded.
	 */
</script>

<svelte:head>
	<title>{site.brandName} — {site.brandTagline}</title>
	<meta name="description" content={site.footerBlurb} />
</svelte:head>

<section class="hero on-dark">
	<div class="hero-inner container-page">
		<Eyebrow text={site.brandTagline} />
		<h1 class="hero-title display">{site.brandName}</h1>
	</div>
</section>

<section class="section-y">
	<div class="intro container-page" use:reveal={{ stagger: 60 }}>
		<div class="reveal">
			<Eyebrow text="Our kitchen" />
		</div>
		<p class="intro-copy reveal">{site.footerBlurb}</p>
	</div>
</section>

<style>
	.hero {
		/* Runs under the fixed, transparent header — cancels the offset that
		   `(site)/+layout.svelte` applies to `main`. */
		margin-top: calc(-1 * var(--header-h));
		display: grid;
		align-items: end;
		min-height: 100svh;
		background-color: var(--color-olive);
		color: var(--color-cream);
	}

	.hero-inner {
		padding-block: clamp(3rem, 8vh, 6rem);
	}

	.hero-title {
		margin-top: 1rem;
		font-size: clamp(3rem, 9vw, 6.5rem);
		color: var(--color-cream);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 46rem;
	}

	.intro-copy {
		font-size: 1.25rem;
		line-height: 1.7;
	}
</style>
