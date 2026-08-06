<script lang="ts">
	import { formatPrice } from '$lib/utils/money';
	import type { CommerceSettings } from '$lib/types/catalogue';

	/**
	 * Price display, gate-aware (§3.4).
	 *
	 * Renders nothing at all when commerce is off, unless the admin has opted
	 * into showing prices while gated. Rendering a struck-through or greyed
	 * price would still be a price — the requirement is that it is absent.
	 *
	 * Omitting `commerce` shows the price, which is the right default for admin
	 * screens where the gate is irrelevant.
	 */
	interface Props {
		cents: number;
		currency: string;
		commerce?: CommerceSettings;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { cents, currency, commerce, size = 'md', class: className = '' }: Props = $props();

	const visible = $derived(!commerce || commerce.enabled || commerce.showPrices);
</script>

{#if visible}
	<p class="price {size} {className}">{formatPrice(cents, currency)}</p>
{/if}

<style>
	.price {
		font-family: var(--font-display);
		font-weight: 500;
		color: var(--color-ink);
		letter-spacing: -0.01em;
	}

	.sm {
		font-size: 1rem;
	}

	.md {
		font-size: 1.25rem;
	}

	.lg {
		font-size: 1.75rem;
	}
</style>
