import type { Action } from 'svelte/action';

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Confines Tab / Shift+Tab to the node's descendants and restores focus to
 * whatever was focused before it mounted (§7.4).
 *
 * Intended for elements rendered inside `{#if open}` so the trap's lifetime is
 * the dialog's lifetime.
 */
export const focusTrap: Action<HTMLElement> = (node) => {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	function focusable(): HTMLElement[] {
		// `getClientRects()` rather than `offsetParent`, which is null for
		// position:fixed elements even when they are perfectly visible.
		return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => el.getClientRects().length > 0
		);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const items = focusable();
		if (items.length === 0) {
			event.preventDefault();
			return;
		}

		const first = items[0];
		const last = items[items.length - 1];
		const current = document.activeElement;
		const inside = current instanceof Node && node.contains(current);

		if (event.shiftKey && (current === first || !inside)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (current === last || !inside)) {
			event.preventDefault();
			first.focus();
		}
	}

	// Wait a frame so opening transitions have laid the content out before we
	// measure what is focusable.
	const raf = requestAnimationFrame(() => focusable()[0]?.focus());
	document.addEventListener('keydown', onKeydown, true);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			document.removeEventListener('keydown', onKeydown, true);
			previouslyFocused?.focus();
		}
	};
};
