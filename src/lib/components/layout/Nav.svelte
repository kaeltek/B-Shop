<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import type { NavLink } from '$lib/types/content';

	/**
	 * Desktop primary navigation with keyboard-operable dropdowns (§7.4).
	 *
	 * Items arrive as a prop rather than being imported here, so the layout can
	 * merge admin-managed data (shop categories) into the static structure
	 * without this component knowing where any of it came from.
	 *
	 * A branch renders as TWO controls, not one: a link that goes to the item's
	 * own page, and a separate button that opens the list. That is the whole
	 * reason this is not a single `<button>` — /shop is a real page, and a
	 * dropdown of category shortcuts must never be the only way to reach it.
	 * It also removes the hover/click conflict outright: neither control has to
	 * guess which kind of input it is responding to.
	 */
	interface Props {
		items: NavLink[];
	}

	let { items }: Props = $props();

	let openIndex = $state<number | null>(null);
	let toggles = $state<Array<HTMLButtonElement | undefined>>([]);
	let panels = $state<Array<HTMLUListElement | undefined>>([]);
	let root = $state<HTMLElement>();

	/**
	 * Whether the pointer can actually hover. Touch screens fire a synthetic
	 * `mouseenter` on tap, so without this check the first tap on a phone would
	 * open the menu via the hover path and the tap itself would close it again.
	 */
	let hoverCapable = $state(false);

	/**
	 * Whether a click, rather than a hover, is what is holding the panel open.
	 *
	 * This is the whole answer to the hover/click conflict. Pointing at the
	 * arrow opens the panel, so by the time a click lands the panel is already
	 * open and a plain toggle would read that click as "close" — press the
	 * thing that opens a menu, watch the menu shut. Instead the first click
	 * PINS what hover opened: it survives the pointer leaving, and only the
	 * next click closes it. Open, then closed, in that order, every time.
	 */
	let pinned = $state(false);

	/** Grace period so a diagonal path into the list does not lose the menu. */
	const CLOSE_DELAY = 140;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	function cancelClose() {
		clearTimeout(closeTimer);
		closeTimer = undefined;
	}

	$effect(() => {
		const query = window.matchMedia('(hover: hover) and (pointer: fine)');
		const sync = () => (hoverCapable = query.matches);

		sync();
		query.addEventListener('change', sync);

		return () => {
			query.removeEventListener('change', sync);
			cancelClose();
		};
	});

	/**
	 * Anything outside the nav closes it. Registered only while something is
	 * open, and in the capture phase so a handler inside the page that stops
	 * propagation cannot strand the menu open.
	 */
	$effect(() => {
		if (openIndex === null) return;

		const onPointerDown = (event: PointerEvent) => {
			if (event.target instanceof Node && root?.contains(event.target)) return;
			dismiss();
		};

		document.addEventListener('pointerdown', onPointerDown, true);
		return () => document.removeEventListener('pointerdown', onPointerDown, true);
	});

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	}

	function isBranchActive(item: NavLink): boolean {
		return isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false);
	}

	function dismiss() {
		cancelClose();
		openIndex = null;
		pinned = false;
	}

	function close(index: number, refocus = false) {
		if (openIndex === index) dismiss();
		if (refocus) toggles[index]?.focus();
	}

	function toggle(index: number) {
		cancelClose();

		if (openIndex === index && pinned) {
			openIndex = null;
			pinned = false;
		} else {
			openIndex = index;
			pinned = true;
		}
	}

	function onMouseEnter(index: number, item: NavLink) {
		if (!hoverCapable) return;
		cancelClose();

		const target = item.children?.length ? index : null;
		if (target === openIndex) return;

		// Moving onto a different item abandons whatever a click pinned open.
		pinned = false;
		openIndex = target;
	}

	function onMouseLeave(index: number) {
		// A pinned panel stays put until it is dismissed deliberately.
		if (!hoverCapable || pinned) return;

		cancelClose();
		closeTimer = setTimeout(() => {
			if (openIndex === index) openIndex = null;
		}, CLOSE_DELAY);
	}

	function onToggleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			close(index, true);
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			cancelClose();
			openIndex = index;
			pinned = true;
			// The panel is only in the DOM once open, so wait a tick for it.
			queueMicrotask(() => panels[index]?.querySelector('a')?.focus());
		}
	}

	function onPanelKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			close(index, true);
		}
	}

	/** Tabbing out of the whole item closes it; moving within it does not. */
	function onFocusOut(event: FocusEvent, index: number) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof Node) {
			if (event.currentTarget.contains(next)) return;
		}
		close(index);
	}
</script>

<nav aria-label="Primary" bind:this={root}>
	<ul class="nav-list">
		{#each items as item, i (`${item.label}-${item.href}`)}
			<li
				class="nav-item"
				onmouseenter={() => onMouseEnter(i, item)}
				onmouseleave={() => onMouseLeave(i)}
				onfocusout={(e) => onFocusOut(e, i)}
			>
				<div class="nav-branch" class:is-open={openIndex === i}>
					<a
						href={item.href}
						class="nav-link"
						class:is-active={item.children?.length ? isBranchActive(item) : isActive(item.href)}
						aria-current={isActive(item.href) ? 'page' : undefined}
						onclick={dismiss}
					>
						<span>{item.label}</span>
					</a>

					{#if item.children?.length}
						<button
							bind:this={toggles[i]}
							type="button"
							class="nav-toggle"
							aria-expanded={openIndex === i}
							aria-controls="nav-dropdown-{i}"
							aria-haspopup="true"
							onclick={() => toggle(i)}
							onkeydown={(e) => onToggleKeydown(e, i)}
						>
							<Icon name="chevron-down" size={14} class="chevron" />
							<span class="sr-only">
								{openIndex === i ? 'Hide' : 'Show'}
								{item.label} categories
							</span>
						</button>
					{/if}
				</div>

				{#if item.children?.length && openIndex === i}
					<ul
						bind:this={panels[i]}
						class="dropdown"
						id="nav-dropdown-{i}"
						transition:fly={{ y: -6, duration: prefersReducedMotion() ? 0 : 180 }}
					>
						{#each item.children as child (child.href)}
							<li>
								<a
									href={child.href}
									aria-current={isActive(child.href) ? 'page' : undefined}
									onclick={dismiss}
									onkeydown={(e) => onPanelKeydown(e, i)}
								>
									{child.label}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nav-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-item {
		position: relative;
	}

	.nav-branch {
		display: flex;
		align-items: center;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 0.85rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--nav-fg, var(--color-ink));
		text-decoration: none;
		transition: color 250ms var(--ease-card);
	}

	/* The arrow sits tight against its label, so the label gives up the padding
	   between them and the button takes it as touch target instead. */
	.nav-branch .nav-link {
		padding-right: 0.25rem;
	}

	.nav-toggle {
		display: grid;
		place-items: center;
		/* Comfortably tappable rather than a 14px icon: this is the control the
		   arrow-is-hard-to-hit complaint was about. */
		width: 2rem;
		height: 2rem;
		margin-right: 0.35rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--nav-fg, var(--color-ink));
		cursor: pointer;
		transition:
			background-color 200ms var(--ease-card),
			color 250ms var(--ease-card);
	}

	.nav-toggle:hover {
		background-color: rgb(192 138 62 / 0.18);
	}

	/* Underline grows from the centre on hover and stays put when the branch is
	   the current page. */
	.nav-link span:first-child {
		position: relative;
	}

	.nav-link span:first-child::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -4px;
		height: 1px;
		background-color: var(--color-accent);
		transform: scaleX(0);
		transition: transform 300ms var(--ease-card);
	}

	.nav-link:hover span:first-child::after,
	.nav-link:focus-visible span:first-child::after,
	.nav-link.is-active span:first-child::after {
		transform: scaleX(1);
	}

	.nav-link:hover,
	.nav-link.is-active,
	.nav-branch.is-open .nav-link,
	.nav-branch.is-open .nav-toggle {
		color: var(--color-accent);
	}

	.nav-toggle :global(.chevron) {
		transition: transform 250ms var(--ease-card);
	}

	.nav-branch.is-open .nav-toggle :global(.chevron) {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		z-index: 40;
		min-width: 12rem;
		margin: 0;
		padding: 0.5rem;
		list-style: none;
		border-radius: var(--radius-image);
		background-color: var(--color-cream);
		box-shadow: 0 18px 40px -18px rgb(33 28 24 / 0.35);
	}

	/* Bridges the gap between the trigger and the panel. Without it the pointer
	   leaves the item on the way down, `mouseleave` fires, and the menu shuts
	   just as you reach for it. */
	.dropdown::before {
		content: '';
		position: absolute;
		inset-inline: 0;
		bottom: 100%;
		height: 0.5rem;
	}

	.dropdown a {
		display: block;
		padding: 0.6rem 0.85rem;
		border-radius: calc(var(--radius-image) - 0.5rem);
		font-size: 0.9375rem;
		color: var(--color-ink);
		text-decoration: none;
		transition:
			background-color 200ms var(--ease-card),
			color 200ms var(--ease-card);
	}

	.dropdown a:hover,
	.dropdown a:focus-visible,
	.dropdown a[aria-current='page'] {
		background-color: var(--color-sand);
		color: var(--color-accent-strong);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
