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
		// Fire slightly before the element is fully in view so the motion
		// finishes about when the reader's eye arrives.
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
	);
	return observer;
}

export const reveal: Action<HTMLElement, RevealParams | undefined> = (node, params) => {
	let cleanup: (() => void) | undefined;

	function apply(p: RevealParams | undefined) {
		cleanup?.();

		const delay = p?.delay ?? 0;
		const stagger = p?.stagger ?? 0;

		const children = stagger
			? Array.from(node.querySelectorAll<HTMLElement>(':scope > .reveal'))
			: [];
		const targets = children.length > 0 ? children : [node];

		targets.forEach((el, i) => {
			const total = delay + i * stagger;
			if (total > 0) el.style.setProperty('--reveal-delay', `${total}ms`);
		});

		const show = () => {
			for (const el of targets) el.setAttribute('data-revealed', '');
		};

		// Reduced motion: skip observation entirely and render final state.
		if (prefersReducedMotion()) {
			for (const el of targets) el.style.removeProperty('--reveal-delay');
			show();
			cleanup = undefined;
			return;
		}

		registry.set(node, show);
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
