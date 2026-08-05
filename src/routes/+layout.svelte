<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	/**
	 * Root layout — shared by the `(site)` and `(admin)` groups. Deliberately
	 * thin: it owns global stylesheet and favicon only. Chrome belongs to the
	 * route group, and the commerce settings load lands here in P4.
	 */
	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
