<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import type { ContactDetails, FooterColumn, SocialLink } from '$lib/types/content';

	/**
	 * Site footer (§8.13) on `--color-olive`. Carries `.on-dark`, which
	 * re-points `--accent-text` and `--focus-ring` at their light variants so
	 * everything inside stays above 4.5:1 without per-element overrides.
	 */
	interface Props {
		brandName: string;
		blurb: string;
		columns: FooterColumn[];
		social: SocialLink[];
		contact: ContactDetails;
	}

	let { brandName, blurb, columns, social, contact }: Props = $props();

	const year = new Date().getFullYear();
</script>

<footer class="footer on-dark">
	<div class="container-page">
		<div class="footer-grid">
			<div class="footer-brand">
				<span class="brand-name">{brandName}</span>
				<p class="blurb">{blurb}</p>
				<ul class="social">
					{#each social as link (link.href)}
						<li>
							<a href={link.href} target="_blank" rel="noopener noreferrer">
								<Icon name={link.icon} size={18} />
								<span class="sr-only">{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="footer-contact">
				<Eyebrow text="Find us" />
				<address>
					{#each contact.addressLines as line (line)}
						<span>{line}</span>
					{/each}
				</address>
				<a href="tel:{contact.phone}">{contact.phoneDisplay}</a>
				<a href="mailto:{contact.email}">{contact.email}</a>
			</div>

			{#each columns as column (column.heading)}
				<nav class="footer-column" aria-label={column.heading}>
					<Eyebrow text={column.heading} />
					<ul>
						{#each column.links as link (`${link.label}-${link.href}`)}
							<li><a href={link.href}>{link.label}</a></li>
						{/each}
					</ul>
				</nav>
			{/each}
		</div>

		<div class="copyright">
			<p>© {year} {brandName}. All rights reserved.</p>
			<ul>
				<li><a href="/privacy">Privacy</a></li>
				<li><a href="/terms">Terms</a></li>
			</ul>
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--color-olive);
		color: color-mix(in srgb, var(--color-cream) 82%, transparent);
		padding-top: clamp(3.5rem, 7vw, 6rem);
	}

	.footer-grid {
		display: grid;
		gap: 2.5rem;
		padding-bottom: 3rem;
	}

	.brand-name {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--color-cream);
	}

	.blurb {
		margin-top: 0.75rem;
		max-width: 34ch;
		font-size: 0.9375rem;
		line-height: 1.7;
	}

	.social {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
		list-style: none;
		padding: 0;
	}

	.social a {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid color-mix(in srgb, var(--color-cream) 24%, transparent);
		border-radius: var(--radius-pill);
		color: var(--color-cream);
		transition:
			background-color 250ms var(--ease-card),
			color 250ms var(--ease-card),
			border-color 250ms var(--ease-card);
	}

	.social a:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-ink);
	}

	.footer-contact {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.9375rem;
	}

	.footer-contact address {
		display: flex;
		flex-direction: column;
		margin-top: 0.5rem;
		font-style: normal;
	}

	.footer-contact a {
		color: var(--color-cream);
		text-decoration: none;
	}

	.footer-contact a:hover {
		color: var(--color-accent-soft);
	}

	.footer-column ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
		list-style: none;
		padding: 0;
		font-size: 0.9375rem;
	}

	.footer-column a {
		color: inherit;
		text-decoration: none;
		transition: color 200ms var(--ease-card);
	}

	.footer-column a:hover {
		color: var(--color-accent-soft);
	}

	.copyright {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-top: 1px solid color-mix(in srgb, var(--color-cream) 14%, transparent);
		padding-block: 1.5rem;
		font-size: 0.8125rem;
	}

	.copyright ul {
		display: flex;
		gap: 1.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.copyright a {
		color: inherit;
		text-decoration: none;
	}

	.copyright a:hover {
		color: var(--color-accent-soft);
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

	@media (width >= 48rem) {
		.footer-grid {
			grid-template-columns: 1.6fr 1fr 1fr 1fr;
			gap: 3rem;
		}
	}
</style>
