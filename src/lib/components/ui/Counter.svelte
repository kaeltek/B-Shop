<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import { prefersReducedMotion } from '$lib/utils/motion';

	/**
	 * Number that counts up once when it scrolls into view (§8.4).
	 *
	 * Under reduced motion it renders the final value immediately — animating
	 * in 1ms would technically satisfy the media query while still being the
	 * flicker the user asked not to see (§7.3).
	 */
	interface Props {
		value: number;
		suffix?: string;
		label: string;
		duration?: number;
	}

	let { value, suffix = '', label, duration = 1600 }: Props = $props();

	// Null until the animation takes over, so the rendered number falls back to
	// the prop. Server-rendered HTML and no-JS clients show the real value
	// rather than a zero that never moves, and a changed prop still flows
	// through — which a plain `$state(value)` snapshot would not.
	let animated = $state<number | null>(null);

	const display = $derived(animated ?? value);

	function run() {
		if (prefersReducedMotion()) return;

		const target = value;
		const start = performance.now();
		animated = 0;

		const step = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			// easeOutCubic — fast to begin, settles rather than stops dead.
			const eased = 1 - Math.pow(1 - progress, 3);
			animated = Math.round(eased * target);
			if (progress < 1) requestAnimationFrame(step);
			else animated = null; // hand control back to the prop
		};

		requestAnimationFrame(step);
	}
</script>

<div class="counter" use:inView={run}>
	<p class="value">
		{display}{suffix}
	</p>
	<p class="label">{label}</p>
</div>

<style>
	.counter {
		text-align: center;
	}

	.value {
		font-family: var(--font-display);
		font-size: clamp(2.75rem, 5vw, 4rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		/* Digits are proportional in Playfair; tabular figures stop the number
		   jittering sideways as it counts. */
		font-variant-numeric: tabular-nums;
	}

	.label {
		margin-top: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}
</style>
