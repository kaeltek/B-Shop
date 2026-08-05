<script lang="ts">
	/**
	 * Inline SVG icon set. Kept local rather than pulled from an icon package so
	 * the markup ships no runtime dependency and every glyph inherits
	 * `currentColor` and the surrounding stroke weight.
	 */
	export type IconName =
		| 'menu'
		| 'close'
		| 'chevron-down'
		| 'search'
		| 'user'
		| 'bag'
		| 'arrow-up'
		| 'instagram'
		| 'facebook'
		| 'youtube';

	interface Props {
		name: IconName;
		size?: number;
		class?: string;
	}

	let { name, size = 20, class: className = '' }: Props = $props();
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'menu'}
		<line x1="3" y1="7" x2="21" y2="7" />
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="17" x2="21" y2="17" />
	{:else if name === 'close'}
		<line x1="5" y1="5" x2="19" y2="19" />
		<line x1="19" y1="5" x2="5" y2="19" />
	{:else if name === 'chevron-down'}
		<polyline points="6 9 12 15 18 9" />
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="7" />
		<line x1="16.5" y1="16.5" x2="21" y2="21" />
	{:else if name === 'user'}
		<circle cx="12" cy="8" r="4" />
		<path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8" />
	{:else if name === 'bag'}
		<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
		<line x1="3" y1="6" x2="21" y2="6" />
		<path d="M16 10a4 4 0 0 1-8 0" />
	{:else if name === 'arrow-up'}
		<line x1="12" y1="20" x2="12" y2="5" />
		<polyline points="6 11 12 5 18 11" />
	{:else if name === 'instagram'}
		<rect x="2" y="2" width="20" height="20" rx="5" />
		<circle cx="12" cy="12" r="4" />
		<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
	{:else if name === 'facebook'}
		<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
	{:else if name === 'youtube'}
		<rect x="2" y="5" width="20" height="14" rx="4" />
		<polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
	{/if}
</svg>
