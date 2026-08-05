<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';

	/** Scroll-to-top button, appears past 600px (§8.14). */
	let visible = $state(false);

	$effect(() => {
		const onScroll = () => {
			visible = window.scrollY > 600;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function toTop() {
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion() ? 'auto' : 'smooth'
		});
	}
</script>

<button
	type="button"
	class="to-top"
	class:is-visible={visible}
	onclick={toTop}
	tabindex={visible ? 0 : -1}
>
	<Icon name="arrow-up" size={18} />
	<span class="sr-only">Back to top</span>
</button>

<style>
	.to-top {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 45;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-ink);
		color: var(--color-cream);
		cursor: pointer;
		opacity: 0;
		transform: translateY(0.75rem);
		visibility: hidden;
		transition:
			opacity 300ms var(--ease-card),
			transform 300ms var(--ease-card),
			visibility 300ms,
			background-color 200ms var(--ease-card);
	}

	.to-top.is-visible {
		opacity: 1;
		transform: none;
		visibility: visible;
	}

	.to-top:hover {
		background-color: var(--color-accent-strong);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
