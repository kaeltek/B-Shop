<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { ContactDetails } from '$lib/types/content';

	/** Contact block with real tel: and mailto: links (§8.11). */
	interface Props {
		contact: ContactDetails;
		eyebrow?: string;
		heading?: string;
		body?: string;
		/**
		 * Surface tint. The homepage sets `sand` so the run of sections after the
		 * gallery still alternates tone — the newsletter block used to provide
		 * that break. `/contact` leaves it plain, where the section follows its
		 * own page header and needs no separation.
		 */
		surface?: 'plain' | 'sand';
	}

	let {
		contact,
		eyebrow = 'Come and find us',
		heading = 'On the corner, under the green awning',
		body = 'We also offer catering for events, celebrations and parties. Call us to discuss your requirements.',
		surface = 'plain'
	}: Props = $props();
</script>

<section class="contact section-y" class:sand={surface === 'sand'}>
	<div class="container-page grid" use:reveal={{ stagger: 80 }}>
		<div class="copy reveal">
			<Eyebrow text={eyebrow} />
			<h2 class="heading display">{heading}</h2>
			<p>{body}</p>
			<Button href="tel:{contact.phone}" variant="outline">CALL NOW</Button>
		</div>

		<div class="blocks reveal">
			<div class="block">
				<h3>Address</h3>
				<address>
					{#each contact.addressLines as line (line)}
						<span>{line}</span>
					{/each}
				</address>
			</div>

			<div class="block">
				<h3>Reach us</h3>
				<p><a href="tel:{contact.phone}">{contact.phoneDisplay}</a></p>
				<p><a href="mailto:{contact.email}">{contact.email}</a></p>
			</div>

			<div class="block">
				<h3>Hours</h3>
				{#each contact.hours as line (line)}
					<p>{line}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.contact.sand {
		background-color: var(--color-sand);
	}

	.grid {
		display: grid;
		gap: 3rem;
	}

	.copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.25rem;
	}

	.heading {
		max-width: 16ch;
		font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	}

	.copy p {
		max-width: 46ch;
	}

	.blocks {
		display: grid;
		gap: 2rem;
		align-content: start;
	}

	.block h3 {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-text);
		margin-bottom: 0.75rem;
	}

	.block address {
		display: flex;
		flex-direction: column;
		font-style: normal;
	}

	.block p {
		margin: 0;
	}

	.block a {
		color: var(--color-ink);
		text-decoration: none;
		border-bottom: 1px solid rgb(33 28 24 / 0.2);
	}

	.block a:hover {
		color: var(--color-accent-strong);
		border-color: currentColor;
	}

	@media (width >= 56rem) {
		.grid {
			grid-template-columns: 1fr 1fr;
			gap: 5rem;
		}

		.blocks {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
