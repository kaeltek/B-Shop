<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import type { HeroSlide } from '$lib/types/home';

	/**
	 * Full-viewport hero slider (§8.2): one slide per photograph, crossfade, 6s
	 * interval, pause on hover, manual dots.
	 *
	 * Auto-advance never starts under reduced motion — carousels that move on
	 * their own are exactly what that preference is asking to stop. The dots
	 * still work, so no content becomes unreachable.
	 */
	interface Props {
		slides: HeroSlide[];
	}

	let { slides }: Props = $props();

	let index = $state(0);
	let paused = $state(false);

	const INTERVAL = 6000;

	$effect(() => {
		if (paused || slides.length < 2 || prefersReducedMotion()) return;

		const timer = setInterval(() => {
			index = (index + 1) % slides.length;
		}, INTERVAL);

		return () => clearInterval(timer);
	});
</script>

<section
	class="hero on-dark"
	aria-roledescription="carousel"
	aria-label="Featured"
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	{#each slides as slide, i (slide.image.src)}
		<div
			class="slide"
			class:is-active={i === index}
			role="group"
			aria-roledescription="slide"
			aria-label="{i + 1} of {slides.length}"
			aria-hidden={i === index ? undefined : 'true'}
			inert={i === index ? undefined : true}
		>
			<div class="media">
				<!-- Full-bleed, so the browser always needs the variant closest to
				     the viewport width. `width`/`height` are the intrinsic size of
				     the widest variant: they fix the aspect ratio while the file is
				     in flight, which is what stops the copy jumping on load. -->
				<img
					src={slide.image.src}
					srcset={slide.image.srcset}
					sizes="100vw"
					alt={slide.image.alt}
					width={slide.image.width}
					height={slide.image.height}
					style:object-position={slide.image.focus}
					decoding="async"
					fetchpriority={i === 0 ? 'high' : 'auto'}
					loading="eager"
				/>
			</div>
			<div class="scrim" aria-hidden="true"></div>

			<div class="content container-page">
				<Eyebrow text={slide.eyebrow} />
				<h1 class="heading display">
					{slide.headingLines[0]}<br />{slide.headingLines[1]}
				</h1>
				<Button href={slide.ctaHref}>{slide.ctaLabel}</Button>
			</div>
		</div>
	{/each}

	{#if slides.length > 1}
		<div class="dots">
			{#each slides as slide, i (slide.image.src)}
				<button
					type="button"
					class="dot"
					class:is-active={i === index}
					aria-current={i === index ? 'true' : undefined}
					onclick={() => (index = i)}
				>
					<span class="sr-only">Go to slide {i + 1}</span>
				</button>
			{/each}
		</div>
	{/if}
</section>

<style>
	.hero {
		/* Runs under the fixed, transparent header — cancels the offset that
		   `(site)/+layout.svelte` puts on `main`. */
		margin-top: calc(-1 * var(--header-h));
		position: relative;
		min-height: 100svh;
		overflow: hidden;
		background-color: var(--color-olive);
		color: var(--color-cream);
	}

	.slide {
		position: absolute;
		inset: 0;
		display: grid;
		align-items: center;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 900ms var(--ease-card),
			visibility 900ms;
	}

	.slide.is-active {
		opacity: 1;
		visibility: visible;
	}

	.media {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* `object-position` is set per slide from the content module. */
	}

	/* A slow drift on the slide currently showing. The photographs are wide and
	   the crop is tight on a phone, so this also quietly reveals a little more
	   of each one over the six seconds it is up. */
	.slide.is-active .media img {
		animation: hero-drift 9s var(--ease-card) forwards;
	}

	@keyframes hero-drift {
		from {
			transform: scale(1.02);
		}
		to {
			transform: scale(1.09);
		}
	}

	/*
	 * Both photographs are bright and low-contrast — cream on cream. The scrim
	 * is heavier than it would need to be over darker art, and is what keeps the
	 * heading above 4.5:1 (§10). Horizontal on wide screens, where the copy sits
	 * in the left column; see the narrow-screen override below.
	 */
	.scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to right,
			rgb(33 28 24 / 0.82),
			rgb(33 28 24 / 0.62) 45%,
			rgb(33 28 24 / 0.32)
		);
	}

	.content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.75rem;
		padding-block: 8rem 6rem;
	}

	.heading {
		max-width: 18ch;
		font-size: clamp(2.75rem, 7vw, 5.5rem);
		color: var(--color-cream);
	}

	.dots {
		position: absolute;
		bottom: 2.5rem;
		left: 50%;
		z-index: 2;
		translate: -50% 0;
		display: flex;
		gap: 0.65rem;
	}

	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border: 1px solid var(--color-cream);
		border-radius: var(--radius-pill);
		background: none;
		padding: 0;
		cursor: pointer;
		transition:
			background-color 250ms var(--ease-card),
			width 250ms var(--ease-card);
	}

	.dot.is-active {
		width: 1.75rem;
		background-color: var(--color-accent);
		border-color: var(--color-accent);
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

	/*
	 * A phone crops most of the width away, so the copy no longer sits over the
	 * empty part of the picture and a left-to-right scrim would be pointless.
	 * Weight it from the bottom, drop the copy to meet it, and leave the top of
	 * the frame clear so the photograph still reads as one.
	 */
	@media (width < 48rem) {
		.slide {
			align-items: end;
		}

		.scrim {
			background: linear-gradient(
				to bottom,
				rgb(33 28 24 / 0.45),
				rgb(33 28 24 / 0.3) 30%,
				rgb(33 28 24 / 0.82)
			);
		}

		.content {
			gap: 1.25rem;
			padding-block: 6rem 5.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide {
			transition: none;
		}

		.slide.is-active .media img {
			animation: none;
		}
	}
</style>
