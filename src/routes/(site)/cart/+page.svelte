<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	/** Reachable only when commerce is enabled — the load guards it. */
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Your basket</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="section-y">
	<div class="container-page">
		<Eyebrow text="Your basket" />
		<h1 class="title display">Nothing in here yet</h1>

		{#if data.items.length === 0}
			<p class="body">Have a look through the shop and add something you like.</p>
			<Button href="/shop" variant="outline">Back to the shop</Button>
		{/if}
	</div>
</section>

<style>
	.title {
		margin-top: 1rem;
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.body {
		margin-block: 1.25rem 2rem;
		max-width: 46ch;
	}
</style>
