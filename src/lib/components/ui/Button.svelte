<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Pill CTA (§7.1 — buttons are full-pill).
	 *
	 * Renders an `<a>` when given an href and a `<button>` otherwise, so a
	 * navigation never becomes a button that a keyboard user cannot open in a
	 * new tab.
	 *
	 * `solid` uses ink-on-amber, which measures 5.59:1 — the brand amber cannot
	 * carry white text at 3.02:1.
	 */
	interface Props {
		children: Snippet;
		href?: string;
		variant?: 'solid' | 'outline' | 'ghost';
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		children,
		href,
		variant = 'solid',
		type = 'button',
		disabled = false,
		class: className = '',
		onclick
	}: Props = $props();
</script>

{#if href}
	<a {href} class="btn {variant} {className}" {onclick}>
		{@render children()}
	</a>
{:else}
	<button {type} class="btn {variant} {className}" {disabled} {onclick}>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		padding: 0.85rem 1.75rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 250ms var(--ease-card),
			border-color 250ms var(--ease-card),
			color 250ms var(--ease-card),
			transform 250ms var(--ease-card);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.solid {
		background-color: var(--color-accent);
		color: var(--color-ink);
	}

	.solid:hover:not(:disabled) {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.outline {
		border-color: currentColor;
		background: none;
		color: var(--color-ink);
	}

	.outline:hover:not(:disabled) {
		background-color: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-cream);
	}

	/* On olive, `outline` inherits cream text from the section and inverts to
	   ink-on-cream, which stays above 4.5:1 both ways. */
	:global(.on-dark) .outline {
		color: var(--color-cream);
	}

	:global(.on-dark) .outline:hover:not(:disabled) {
		background-color: var(--color-cream);
		border-color: var(--color-cream);
		color: var(--color-ink);
	}

	.ghost {
		background: none;
		padding-inline: 0;
		color: var(--accent-text);
	}

	.ghost:hover:not(:disabled) {
		color: var(--color-ink);
	}
</style>
