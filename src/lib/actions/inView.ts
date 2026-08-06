import type { Action } from 'svelte/action';

/**
 * Fires once, the first time the element enters the viewport.
 *
 * Companion to `reveal`, for behaviour that needs a callback rather than a
 * class — counters animating on entry (§8.4), lazy work that should not run
 * above the fold. Shares one observer across all use sites, like `reveal` does.
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
		{ rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
	);
	return observer;
}

export const inView: Action<HTMLElement, () => void> = (node, callback) => {
	let current = callback;

	registry.set(node, () => current());
	getObserver().observe(node);

	return {
		update(next: () => void) {
			current = next;
		},
		destroy() {
			registry.delete(node);
			observer?.unobserve(node);
		}
	};
};
