<script lang="ts">
	/**
	 * Decorative botanical marks that bleed off section edges (§7.3 #2).
	 *
	 * The spec says PNG; these are inline SVG instead. They are line drawings,
	 * so SVG is a fraction of the weight, stays sharp at any density, takes its
	 * colour from the surrounding theme, and adds no network request to the
	 * critical path. Swap in PNGs later without touching call sites — the
	 * positioning contract is the props, not the artwork.
	 *
	 * Always `aria-hidden` and `pointer-events: none`: decoration must never
	 * reach the accessibility tree or eat a click. Two per section, maximum.
	 */
	interface Props {
		mark: 'sprig' | 'fennel' | 'wheat' | 'citrus';
		/** Corner to bleed from. */
		position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		size?: number;
		opacity?: number;
		rotate?: number;
	}

	let { mark, position, size = 200, opacity = 0.12, rotate = 0 }: Props = $props();
</script>

<div
	class="accent {position}"
	style="--size: {size}px; --opacity: {opacity}; --rotate: {rotate}deg;"
	aria-hidden="true"
>
	<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5">
		{#if mark === 'sprig'}
			<path d="M20 180 Q100 130 180 40" stroke-width="2" />
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ellipse
					cx={44 + i * 30}
					cy={162 - i * 30}
					rx="20"
					ry="9"
					transform="rotate({-40 + i * 5} {44 + i * 30} {162 - i * 30})"
				/>
			{/each}
		{:else if mark === 'fennel'}
			<path d="M100 190 L100 70" stroke-width="2" />
			{#each [0, 1, 2, 3, 4, 5, 6] as i (i)}
				<path d="M100 70 Q{60 + i * 13} {36 - (i % 3) * 8} {40 + i * 20} {14 + (i % 2) * 12}" />
				<circle cx={40 + i * 20} cy={14 + (i % 2) * 12} r="3.5" />
			{/each}
		{:else if mark === 'wheat'}
			<path d="M100 195 L100 45" stroke-width="2" />
			{#each [0, 1, 2, 3, 4] as i (i)}
				<ellipse cx="84" cy={72 + i * 26} rx="15" ry="7" transform="rotate(-30 84 {72 + i * 26})" />
				<ellipse
					cx="116"
					cy={72 + i * 26}
					rx="15"
					ry="7"
					transform="rotate(30 116 {72 + i * 26})"
				/>
			{/each}
		{:else}
			<circle cx="100" cy="100" r="72" />
			<circle cx="100" cy="100" r="52" />
			{#each [0, 30, 60, 90, 120, 150] as a (a)}
				<line
					x1={100 + 8 * Math.cos((a * Math.PI) / 180)}
					y1={100 + 8 * Math.sin((a * Math.PI) / 180)}
					x2={100 + 72 * Math.cos((a * Math.PI) / 180)}
					y2={100 + 72 * Math.sin((a * Math.PI) / 180)}
				/>
				<line
					x1={100 - 8 * Math.cos((a * Math.PI) / 180)}
					y1={100 - 8 * Math.sin((a * Math.PI) / 180)}
					x2={100 - 72 * Math.cos((a * Math.PI) / 180)}
					y2={100 - 72 * Math.sin((a * Math.PI) / 180)}
				/>
			{/each}
		{/if}
	</svg>
</div>

<style>
	.accent {
		position: absolute;
		z-index: 0;
		width: var(--size);
		height: var(--size);
		color: var(--color-accent);
		opacity: var(--opacity);
		transform: rotate(var(--rotate));
		pointer-events: none;
	}

	.accent svg {
		width: 100%;
		height: 100%;
	}

	.top-left {
		top: 0;
		left: 0;
		translate: -25% -25%;
	}

	.top-right {
		top: 0;
		right: 0;
		translate: 25% -25%;
	}

	.bottom-left {
		bottom: 0;
		left: 0;
		translate: -25% 25%;
	}

	.bottom-right {
		bottom: 0;
		right: 0;
		translate: 25% 25%;
	}

	/* Decoration is the first thing to go when space is tight. */
	@media (width < 48rem) {
		.accent {
			display: none;
		}
	}
</style>
