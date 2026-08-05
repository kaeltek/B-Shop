<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { NavLink } from '$lib/types/content';

	/**
	 * Desktop primary navigation with keyboard-operable dropdowns (§7.4).
	 *
	 * Items arrive as a prop rather than being imported here, so the layout can
	 * merge admin-managed data (shop categories) into the static structure
	 * without this component knowing where any of it came from.
	 */
	interface Props {
		items: NavLink[];
	}

	let { items }: Props = $props();

	let openIndex = $state<number | null>(null);
	let triggers = $state<Array<HTMLButtonElement | undefined>>([]);

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	}

	function isBranchActive(item: NavLink): boolean {
		return isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false);
	}

	function close(index: number, refocus = false) {
		if (openIndex === index) openIndex = null;
		if (refocus) triggers[index]?.focus();
	}

	/**
	 * A pointer click is always preceded by `mouseenter`, which has already
	 * opened the dropdown — so a plain toggle here would close it again on the
	 * way in and the trigger would look broken. Keyboard activation sends no
	 * pointer events, and `MouseEvent.detail` is 0 for it, which is what
	 * separates the two cases.
	 */
	function onTriggerClick(event: MouseEvent, index: number) {
		const fromKeyboard = event.detail === 0;
		openIndex = fromKeyboard && openIndex === index ? null : index;
	}

	function onKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape' && openIndex === index) {
			event.stopPropagation();
			close(index, true);
		}
	}

	function onFocusOut(event: FocusEvent, index: number) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof Node) {
			if (event.currentTarget.contains(next)) return;
		}
		close(index);
	}
</script>

<nav aria-label="Primary">
	<ul class="nav-list">
		{#each items as item, i (`${item.label}-${item.href}`)}
			<li
				class="nav-item"
				onmouseenter={() => (openIndex = item.children?.length ? i : null)}
				onmouseleave={() => close(i)}
				onfocusout={(e) => onFocusOut(e, i)}
			>
				{#if item.children?.length}
					<button
						bind:this={triggers[i]}
						type="button"
						class="nav-link"
						class:is-active={isBranchActive(item)}
						aria-expanded={openIndex === i}
						aria-controls="nav-dropdown-{i}"
						onclick={(e) => onTriggerClick(e, i)}
						onkeydown={(e) => onKeydown(e, i)}
					>
						<span>{item.label}</span>
						<Icon
							name="chevron-down"
							size={14}
							class="chevron {openIndex === i ? 'is-open' : ''}"
						/>
					</button>

					{#if openIndex === i}
						<ul class="dropdown" id="nav-dropdown-{i}">
							{#each item.children as child (child.href)}
								<li>
									<a
										href={child.href}
										aria-current={isActive(child.href) ? 'page' : undefined}
										onclick={() => (openIndex = null)}
										onkeydown={(e) => onKeydown(e, i)}
									>
										{child.label}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					<a
						href={item.href}
						class="nav-link"
						class:is-active={isActive(item.href)}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						<span>{item.label}</span>
					</a>
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

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.85rem;
		border: 0;
		background: none;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--nav-fg, var(--color-ink));
		cursor: pointer;
		transition: color 250ms var(--ease-card);
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
	.nav-link.is-active {
		color: var(--color-accent);
	}

	.nav-link :global(.chevron) {
		transition: transform 250ms var(--ease-card);
	}

	.nav-link :global(.chevron.is-open) {
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
		animation: dropdown-in 180ms var(--ease-card);
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
	.dropdown a[aria-current='page'] {
		background-color: var(--color-sand);
		color: var(--color-accent-strong);
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
</style>
