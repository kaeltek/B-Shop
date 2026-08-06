<script lang="ts">
	import Counter from '$lib/components/ui/Counter.svelte';
	import type { CounterItem } from '$lib/types/home';

	/** Four animated counters on sand (§8.4). */
	interface Props {
		counters: CounterItem[];
	}

	let { counters }: Props = $props();
</script>

<section class="strip">
	<div class="container-page grid">
		{#each counters as counter (counter.label)}
			<Counter value={counter.value} suffix={counter.suffix} label={counter.label} />
		{/each}
	</div>
</section>

<style>
	.strip {
		background-color: var(--color-sand);
		padding-block: clamp(3rem, 6vw, 5rem);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2.5rem 1.5rem;
	}

	@media (width >= 56rem) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
