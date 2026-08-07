<script lang="ts">
	import { fade } from 'svelte/transition';
	import { focusTrap } from '$lib/actions/focusTrap';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { GalleryImage } from '$lib/types/home';

	/**
	 * Gallery lightbox with full keyboard navigation (§8.9, §10).
	 *
	 * Escape closes, arrow keys move, Tab is trapped, and focus returns to the
	 * thumbnail that opened it.
	 */
	interface Props {
		images: GalleryImage[];
		/** Index of the open image, or null when closed. */
		index: number | null;
		onclose: () => void;
		onnavigate: (index: number) => void;
	}

	let { images, index, onclose, onnavigate }: Props = $props();

	const duration = prefersReducedMotion() ? 0 : 200;
	const current = $derived(index === null ? null : images[index]);

	function go(delta: number) {
		if (index === null) return;
		onnavigate((index + delta + images.length) % images.length);
	}

	function onKeydown(event: KeyboardEvent) {
		if (index === null) return;
		switch (event.key) {
			case 'Escape':
				onclose();
				break;
			case 'ArrowRight':
				event.preventDefault();
				go(1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				go(-1);
				break;
		}
	}

	$effect(() => {
		if (index === null) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});
</script>

<svelte:window onkeydown={index === null ? undefined : onKeydown} />

{#if current}
	<div
		class="lightbox on-dark"
		role="dialog"
		aria-modal="true"
		aria-label="Gallery image {(index ?? 0) + 1} of {images.length}"
		use:focusTrap
		transition:fade={{ duration }}
	>
		<button type="button" class="backdrop" onclick={onclose} tabindex="-1" aria-hidden="true"
		></button>

		<div class="frame">
			<figure>
				<img
					src={current.src}
					srcset={current.srcset}
					sizes="(min-width: 68rem) 60rem, 92vw"
					width={current.width}
					height={current.height}
					alt={current.alt}
					decoding="async"
				/>
				<figcaption>{current.alt}</figcaption>
			</figure>
		</div>

		<button type="button" class="control close" onclick={onclose}>
			<Icon name="close" size={22} />
			<span class="sr-only">Close gallery</span>
		</button>

		<button type="button" class="control prev" onclick={() => go(-1)}>
			<Icon name="chevron-down" size={22} class="rot-right" />
			<span class="sr-only">Previous image</span>
		</button>

		<button type="button" class="control next" onclick={() => go(1)}>
			<Icon name="chevron-down" size={22} class="rot-left" />
			<span class="sr-only">Next image</span>
		</button>

		<p class="counter" aria-hidden="true">{(index ?? 0) + 1} / {images.length}</p>
	</div>
{/if}

<style>
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: grid;
		place-items: center;
		padding: clamp(1rem, 5vw, 4rem);
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background-color: rgb(33 28 24 / 0.92);
		cursor: pointer;
	}

	.frame {
		position: relative;
		width: min(60rem, 100%);
	}

	figure {
		margin: 0;
	}

	/* No forced aspect ratio: the photograph is shown whole, bounded by whichever
	   of the two axes runs out first. The caption is reserved out of the height
	   so a tall image never pushes it off-screen. */
	figure img {
		display: block;
		width: 100%;
		height: auto;
		max-height: calc(100dvh - 12rem);
		object-fit: contain;
		margin-inline: auto;
		border-radius: var(--radius-organic);
	}

	figcaption {
		margin-top: 1rem;
		text-align: center;
		font-size: 0.9375rem;
		color: color-mix(in srgb, var(--color-cream) 78%, transparent);
	}

	.control {
		position: absolute;
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border: 1px solid color-mix(in srgb, var(--color-cream) 28%, transparent);
		border-radius: var(--radius-pill);
		background: none;
		color: var(--color-cream);
		cursor: pointer;
		transition:
			background-color 200ms var(--ease-card),
			color 200ms var(--ease-card);
	}

	.control:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-ink);
	}

	.close {
		top: 1.25rem;
		right: 1.25rem;
	}

	.prev {
		left: 1.25rem;
		top: 50%;
		translate: 0 -50%;
	}

	.next {
		right: 1.25rem;
		top: 50%;
		translate: 0 -50%;
	}

	.control :global(.rot-right) {
		transform: rotate(90deg);
	}

	.control :global(.rot-left) {
		transform: rotate(-90deg);
	}

	.counter {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		translate: -50% 0;
		font-size: 0.8125rem;
		letter-spacing: 0.12em;
		color: color-mix(in srgb, var(--color-cream) 70%, transparent);
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

	@media (width < 40rem) {
		.prev {
			left: 0.5rem;
		}
		.next {
			right: 0.5rem;
		}
	}
</style>
