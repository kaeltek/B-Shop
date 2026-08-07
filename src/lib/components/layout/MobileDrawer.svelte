<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { focusTrap } from '$lib/actions/focusTrap';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { ContactDetails, NavLink, SocialLink } from '$lib/types/content';

	/**
	 * Full-height mobile navigation drawer (§8.1): nav, contact blocks and
	 * social links. Focus-trapped, Escape closes, background scroll locked.
	 */
	interface Props {
		open: boolean;
		items: NavLink[];
		contact: ContactDetails;
		social: SocialLink[];
		onclose: () => void;
	}

	let { open, items, contact, social, onclose }: Props = $props();

	let expanded = $state<number | null>(null);

	const duration = prefersReducedMotion() ? 0 : 300;

	// Lock background scroll for as long as the drawer is open, and put it back
	// exactly as it was — not hardcoded to `visible`, which would clobber a page
	// that had its own overflow rule.
	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<!-- Backdrop. The drawer itself carries the dialog semantics; this is purely
	     a click target, so the button below it is the accessible affordance. -->
	<div class="backdrop" transition:fade={{ duration }}>
		<button type="button" class="backdrop-hit" onclick={onclose} tabindex="-1" aria-hidden="true"
		></button>
	</div>

	<div
		class="drawer"
		role="dialog"
		aria-modal="true"
		aria-label="Site menu"
		use:focusTrap
		transition:fly={{ x: 320, duration, opacity: 1 }}
	>
		<div class="drawer-head">
			<span class="drawer-title">Menu</span>
			<button type="button" class="icon-button" onclick={onclose}>
				<Icon name="close" size={22} />
				<span class="sr-only">Close menu</span>
			</button>
		</div>

		<nav aria-label="Mobile" class="drawer-nav">
			<ul>
				{#each items as item, i (`${item.label}-${item.href}`)}
					<li>
						<!-- Label and disclosure are separate controls, exactly as on
						     desktop: tapping "Shop" goes to /shop, tapping the arrow
						     expands the categories. One control cannot do both without
						     making one of the two unreachable. -->
						<div class="drawer-row">
							<a href={item.href} class="drawer-link" onclick={onclose}>{item.label}</a>

							{#if item.children?.length}
								<button
									type="button"
									class="drawer-toggle"
									aria-expanded={expanded === i}
									aria-controls="drawer-sub-{i}"
									onclick={() => (expanded = expanded === i ? null : i)}
								>
									<Icon
										name="chevron-down"
										size={18}
										class="chevron {expanded === i ? 'is-open' : ''}"
									/>
									<span class="sr-only">
										{expanded === i ? 'Hide' : 'Show'}
										{item.label} categories
									</span>
								</button>
							{/if}
						</div>

						{#if item.children?.length && expanded === i}
							<ul class="drawer-sub" id="drawer-sub-{i}" transition:slide={{ duration }}>
								{#each item.children as child (child.href)}
									<li><a href={child.href} onclick={onclose}>{child.label}</a></li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="drawer-contact">
			<p class="contact-heading">Visit us</p>
			<address>
				{#each contact.addressLines as line (line)}
					<span>{line}</span>
				{/each}
			</address>
			<a href="tel:{contact.phone}">{contact.phoneDisplay}</a>
			<a href="mailto:{contact.email}">{contact.email}</a>
		</div>

		<ul class="drawer-social">
			{#each social as link (link.href)}
				<li>
					<a href={link.href} rel="noopener noreferrer" target="_blank">
						<Icon name={link.icon} size={18} />
						<span class="sr-only">{link.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		background-color: rgb(33 28 24 / 0.5);
	}

	.backdrop-hit {
		width: 100%;
		height: 100%;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.drawer {
		position: fixed;
		inset-block: 0;
		right: 0;
		z-index: 70;
		display: flex;
		width: min(22rem, 88vw);
		flex-direction: column;
		gap: 2rem;
		overflow-y: auto;
		background-color: var(--color-cream);
		padding: 1.25rem 1.5rem 2.5rem;
	}

	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.drawer-title {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--color-ink);
		cursor: pointer;
		transition: background-color 200ms var(--ease-card);
	}

	.icon-button:hover {
		background-color: var(--color-sand);
	}

	.drawer-nav ul,
	.drawer-social {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.drawer-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid rgb(33 28 24 / 0.08);
	}

	.drawer-link {
		flex: 1;
		padding: 0.9rem 0;
		font-family: var(--font-display);
		font-size: 1.375rem;
		color: var(--color-ink);
		text-align: left;
		text-decoration: none;
	}

	.drawer-link:hover {
		color: var(--color-accent-strong);
	}

	/* A full 44px target, the minimum that is comfortable with a thumb — the
	   old inline 16px chevron was the thing that would not respond. */
	.drawer-toggle {
		display: grid;
		place-items: center;
		flex: none;
		width: 2.75rem;
		height: 2.75rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--color-ink);
		cursor: pointer;
		transition: background-color 200ms var(--ease-card);
	}

	.drawer-toggle:hover {
		background-color: var(--color-sand);
	}

	.drawer-toggle :global(.chevron) {
		transition: transform 250ms var(--ease-card);
	}

	.drawer-toggle :global(.chevron.is-open) {
		transform: rotate(180deg);
	}

	.drawer-sub {
		padding-block: 0.5rem 0.75rem !important;
		padding-left: 1rem !important;
	}

	.drawer-sub a {
		display: block;
		padding: 0.4rem 0;
		font-size: 0.9375rem;
		color: var(--color-muted);
		text-decoration: none;
	}

	.drawer-sub a:hover {
		color: var(--color-accent-strong);
	}

	.drawer-contact {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.9375rem;
	}

	.contact-heading {
		margin-bottom: 0.35rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	.drawer-contact address {
		display: flex;
		flex-direction: column;
		font-style: normal;
		color: var(--color-muted);
	}

	.drawer-contact a {
		color: var(--color-ink);
		text-decoration: none;
	}

	.drawer-contact a:hover {
		color: var(--color-accent-strong);
	}

	.drawer-social {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
	}

	.drawer-social a {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid rgb(33 28 24 / 0.12);
		border-radius: var(--radius-pill);
		color: var(--color-ink);
		transition:
			background-color 200ms var(--ease-card),
			color 200ms var(--ease-card);
	}

	.drawer-social a:hover {
		background-color: var(--color-accent);
		color: var(--color-ink);
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
