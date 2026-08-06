<script lang="ts">
	import { enhance } from '$app/forms';
	import Eyebrow from '$lib/components/ui/Eyebrow.svelte';
	import DecorativeAccent from '$lib/components/ui/DecorativeAccent.svelte';
	import type { HomeContent } from '$lib/types/home';

	/**
	 * Newsletter signup (§8.10).
	 *
	 * Validation, the honeypot check and the rate limit all live on the server —
	 * see the `newsletter` action. Everything here is convenience: the form
	 * works with JavaScript disabled, and `use:enhance` only removes the full
	 * page reload.
	 */
	interface Props {
		content: HomeContent['newsletter'];
		result?: { ok?: boolean; message?: string; email?: string } | null;
	}

	let { content, result = null }: Props = $props();

	let submitting = $state(false);
</script>

<section class="newsletter section-y">
	<DecorativeAccent mark="citrus" position="bottom-left" size={220} opacity={0.09} rotate={-8} />

	<div class="inner container-page">
		<div class="copy">
			<Eyebrow text={content.eyebrow} />
			<h2 class="heading display">{content.heading}</h2>
			<p>{content.body}</p>
		</div>

		<form
			method="POST"
			action="/?/newsletter"
			class="form"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<div class="field">
				<label class="sr-only" for="newsletter-email">Email address</label>
				<input
					id="newsletter-email"
					name="email"
					type="email"
					required
					autocomplete="email"
					placeholder="you@example.com"
					value={result?.email ?? ''}
					aria-describedby="newsletter-status"
				/>
				<button type="submit" disabled={submitting}>
					{submitting ? 'Signing up…' : 'Sign up'}
				</button>
			</div>

			<!--
				Honeypot. Hidden from people, irresistible to naive bots. Not
				`display: none` — some bots skip those — and explicitly removed
				from the tab order and the accessibility tree.
			-->
			<div class="hp" aria-hidden="true">
				<label for="newsletter-website">Leave this field empty</label>
				<input
					id="newsletter-website"
					name="website"
					type="text"
					tabindex="-1"
					autocomplete="off"
				/>
			</div>

			<label class="consent">
				<input type="checkbox" name="consent" value="yes" required />
				<span>{content.consentLabel}</span>
			</label>

			<p
				id="newsletter-status"
				class="status"
				class:is-error={result && !result.ok}
				class:is-ok={result?.ok}
				role="status"
				aria-live="polite"
			>
				{result?.message ?? ''}
			</p>
		</form>
	</div>
</section>

<style>
	.newsletter {
		position: relative;
		overflow: hidden;
		background-color: var(--color-sand);
	}

	.inner {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 2.5rem;
		align-items: center;
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.heading {
		max-width: 20ch;
		font-size: clamp(2rem, 3.5vw, 2.75rem);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	input[type='email'] {
		flex: 1 1 14rem;
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-pill);
		background-color: var(--color-cream);
		padding: 0.85rem 1.35rem;
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-ink);
	}

	input[type='email']::placeholder {
		color: color-mix(in srgb, var(--color-muted) 70%, transparent);
	}

	button {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.85rem 1.75rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
		transition: background-color 250ms var(--ease-card);
	}

	button:hover:not(:disabled) {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.consent {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-muted);
		cursor: pointer;
	}

	.consent input {
		margin-top: 0.2rem;
		accent-color: var(--color-accent-strong);
	}

	.status {
		min-height: 1.25rem;
		font-size: 0.875rem;
	}

	.status.is-error {
		color: #8c2f20;
	}

	.status.is-ok {
		color: var(--color-accent-strong);
	}

	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
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

	@media (width >= 56rem) {
		.inner {
			grid-template-columns: 1fr 1fr;
			gap: 4rem;
		}
	}
</style>
