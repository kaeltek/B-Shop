<script lang="ts">
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import GalleryGrid from '$lib/components/ui/GalleryGrid.svelte';
	import { galleryPage } from '$lib/content/pages';
	import { galleryImages } from '$lib/content/gallery';

	/**
	 * The full gallery. The homepage shows the opening of this same set from the
	 * same module, and the grid below is the same component — one source of
	 * imagery, one layout, one lightbox.
	 */
</script>

<svelte:head>
	<title>Gallery — {galleryPage.intro.title}</title>
	<meta name="description" content={galleryPage.intro.standfirst} />
</svelte:head>

<header class="head section-y">
	<div class="container-page">
		<Eyebrow text={galleryPage.intro.eyebrow} />
		<h1 class="title display">{galleryPage.intro.title}</h1>
		<p class="standfirst">{galleryPage.intro.standfirst}</p>
	</div>
</header>

<div class="container-page">
	<GalleryGrid images={galleryImages} priority />
</div>

<div class="tail"></div>

<style>
	.head {
		padding-bottom: 2.5rem;
	}

	.title {
		margin-top: 1rem;
		max-width: 20ch;
		font-size: clamp(2.5rem, 5.5vw, 4rem);
	}

	.standfirst {
		margin-top: 1.5rem;
		max-width: 56ch;
		font-size: 1.125rem;
	}

	.tail {
		height: clamp(5rem, 10vw, 9rem);
	}
</style>
