<script lang="ts">
	/**
	 * Eyebrow + rule (§7.3, signature element #1) — the small uppercase label
	 * that sits above almost every section heading.
	 *
	 * Colour comes from `--accent-text`, which the `.on-dark` class re-points at
	 * the lighter amber, so this works on cream, sand and olive without a prop.
	 */
	interface Props {
		text: string;
		/** Centre the rule + label, for centred sections like the catering CTA. */
		centered?: boolean;
		class?: string;
	}

	let { text, centered = false, class: className = '' }: Props = $props();
</script>

<p class="eyebrow {centered ? 'is-centered' : ''} {className}">
	<span class="rule" aria-hidden="true"></span>
	<span>{text}</span>
</p>

<style>
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--accent-text);
	}

	.is-centered {
		justify-content: center;
	}

	.rule {
		display: block;
		width: 24px;
		height: 1px;
		flex: none;
		background-color: currentColor;
	}
</style>
