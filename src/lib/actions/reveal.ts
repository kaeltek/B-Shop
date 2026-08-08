import type { Action } from 'svelte/action';
import { prefersReducedMotion } from '$lib/utils/motion';

export interface RevealParams {
	/** Milliseconds to wait before this element starts its transition. */
	delay?: number;
	/**
	 * When set, direct children carrying `.reveal` are revealed in sequence
	 * this many ms apart. §7.3 specifies 60ms across grid children.
	 */
	stagger?: number;
}

/**
 * Scroll-triggered reveal (§7.3): 12px rise + fade, 500ms.
 *
 * The element must carry `class="reveal"` in the markup, not from JS — adding
 * it after hydration would let SSR'd content paint visible and then jump to
 * hidden. `<noscript>` in app.html unhides everything when JS is unavailable,
 * so this degrades to plain visible content rather than a blank page.
 *
 * `data-revealed` goes on the element this is used on, and the `.reveal`
 * utility cascades visibility from there to any `.reveal` inside it. Only the
 * per-child stagger delay is written to the children themselves.
 *
 * One observer is shared across every use site on the page.
 */

const registry = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries, obs) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				registry.get(entry.target)?.();
				registry.delete(entry.target);
				obs.unobserve(entry.target);
			}
		},
		// The margin fires this slightly before the element is fully in view, so
		// the motion finishes about when the reader's eye arrives.
		//
		// No ratio threshold, deliberately. `intersectionRatio` is measured
		// against the element's own size, so an element several times taller than
		// the viewport can never reach even a few percent however far it is
		// scrolled — the shop grid is exactly that, and a threshold of 0.05 left
		// the whole catalogue at opacity 0 on any screen where the grid ran long.
		// Any part of the element crossing the line is the trigger.
		{ rootMargin: '0px 0px -10% 0px' }
	);
	return observer;
}

export const reveal: Action<HTMLElement, RevealParams | undefined> = (node, params) => {
	let cleanup: (() => void) | undefined;

	function apply(p: RevealParams | undefined) {
		cleanup?.();

		const delay = p?.delay ?? 0;
		const stagger = p?.stagger ?? 0;

		const show = (animate: boolean) => {
			// Read at reveal time, not at setup: a filtered grid replaces its
			// children between the two, and staggering a list captured earlier
			// would be staggering nodes that are no longer in the document.
			const children = Array.from(node.querySelectorAll<HTMLElement>(':scope > .reveal'));
			const staggered = children.length > 0 ? children : [node];

			for (const [i, el] of staggered.entries()) {
				const total = animate ? delay + i * stagger : 0;
				if (total > 0) el.style.setProperty('--reveal-delay', `${total}ms`);
				else el.style.removeProperty('--reveal-delay');
			}

			// One attribute, on the group. Children read their visibility off it
			// through CSS, so any that arrive later — a category change, a sort —
			// are visible the moment they mount.
			node.setAttribute('data-revealed', '');
		};

		// Reduced motion: skip observation entirely and render final state.
		if (prefersReducedMotion()) {
			show(false);
			cleanup = undefined;
			return;
		}

		// Already on screen, or already scrolled past — the observer reports
		// neither, since it only ever fires on a crossing that is still to come.
		// Content that the reader can see must never be waiting on one.
		if (node.getBoundingClientRect().top < window.innerHeight) {
			show(true);
			cleanup = undefined;
			return;
		}

		registry.set(node, () => show(true));
		getObserver().observe(node);

		cleanup = () => {
			registry.delete(node);
			observer?.unobserve(node);
		};
	}

	apply(params);

	return {
		update: apply,
		destroy() {
			cleanup?.();
		}
	};
};
