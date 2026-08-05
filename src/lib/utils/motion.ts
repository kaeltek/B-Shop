/**
 * Single source of truth for the reduced-motion preference.
 *
 * CSS already neutralises transitions globally under
 * `prefers-reduced-motion: reduce` (see app.css base layer). This exists for
 * the cases CSS cannot express: JS-driven animation that should render its
 * *final value* immediately rather than run imperceptibly fast — counters,
 * scroll reveals, the hero crossfade.
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
