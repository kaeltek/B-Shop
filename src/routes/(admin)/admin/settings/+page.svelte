<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let saving = $state(false);

	/**
	 * Unsaved edits, or null when the form matches what is stored.
	 *
	 * An override rather than a mirror, so a save — or a change made in another
	 * tab — flows straight through instead of being masked by stale local
	 * state. Cleared once the reload after a save has landed.
	 */
	let draft = $state<{ enabled: boolean; showPrices: boolean } | null>(null);

	const enabled = $derived(draft?.enabled ?? data.commerce.enabled);
	const showPrices = $derived(draft?.showPrices ?? data.commerce.showPrices);

	function edit(patch: Partial<{ enabled: boolean; showPrices: boolean }>) {
		draft = { enabled, showPrices, ...patch };
	}

	function formatWhen(iso: string): string {
		return new Date(iso).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' });
	}
</script>

<svelte:head><title>Settings — Admin</title></svelte:head>

<header class="head">
	<h1>Settings</h1>
	<p>The commerce gate controls what the whole public site does.</p>
</header>

<div class="grid">
	<form
		method="POST"
		action="?/save"
		class="panel"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update({ reset: false });
				// §3.2 — refreshes every load that depends on the settings row, so
				// the header, product cards and prices switch without a reload.
				await invalidate('app:settings');
				// Saved state is now server state.
				draft = null;
				saving = false;
			};
		}}
	>
		<h2>Commerce</h2>

		<label class="switch">
			<input
				type="checkbox"
				name="commerceEnabled"
				checked={enabled}
				onchange={(e) => edit({ enabled: e.currentTarget.checked })}
			/>
			<span class="switch-body">
				<span class="switch-label">Commerce enabled</span>
				<span class="switch-note">
					{#if enabled}
						Prices, cart and checkout are live. Cart and checkout routes resolve.
					{:else}
						The site is a browsable catalogue. Cart and checkout return 404, and the cart API
						returns 403.
					{/if}
				</span>
			</span>
		</label>

		<label class="switch" class:is-muted={enabled}>
			<input
				type="checkbox"
				name="showPricesWhenGated"
				checked={showPrices}
				disabled={enabled}
				onchange={(e) => edit({ showPrices: e.currentTarget.checked })}
			/>
			<span class="switch-body">
				<span class="switch-label">Show prices while gated</span>
				<span class="switch-note">
					{#if enabled}
						Only applies while commerce is off.
					{:else if showPrices}
						Prices are visible even though nothing can be bought.
					{:else}
						Prices are hidden everywhere.
					{/if}
				</span>
			</span>
		</label>

		<label class="field">
			<span class="field-label">Gated notice</span>
			<textarea
				name="gatedNotice"
				rows="2"
				placeholder="Optional banner shown while commerce is off"
				value={data.commerce.notice ?? ''}></textarea>
			<span class="field-note">Leave empty for no banner.</span>
		</label>

		{#if form?.message}
			<p class="result" class:is-error={!form.ok} role="status">{form.message}</p>
		{/if}

		<button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
	</form>

	<section class="panel">
		<h2>Change history</h2>
		<p class="panel-note">Written by the database, so dashboard and psql edits appear here too.</p>

		{#if data.audit.length === 0}
			<p class="empty">No changes recorded yet.</p>
		{:else}
			<ul class="audit">
				{#each data.audit as entry (entry.id)}
					<li>
						<span class="audit-field">{entry.field.replaceAll('_', ' ')}</span>
						<span class="audit-change">
							<code>{entry.oldValue ?? '—'}</code> → <code>{entry.newValue ?? '—'}</code>
						</span>
						<time datetime={entry.changedAt}>{formatWhen(entry.changedAt)}</time>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.head {
		margin-bottom: 2rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.head p {
		margin-top: 0.4rem;
		font-size: 0.9375rem;
	}

	.grid {
		display: grid;
		gap: 1.5rem;
		align-items: start;
	}

	.panel {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.75rem;
	}

	.panel h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.panel-note,
	.field-note,
	.switch-note {
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.panel-note {
		margin-top: -0.75rem;
		margin-bottom: 1.25rem;
	}

	.switch {
		display: flex;
		gap: 0.85rem;
		border-top: 1px solid rgb(33 28 24 / 0.1);
		padding-block: 1.1rem;
		cursor: pointer;
	}

	.switch.is-muted {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.switch input {
		margin-top: 0.25rem;
		width: 1.1rem;
		height: 1.1rem;
		accent-color: var(--color-accent-strong);
	}

	.switch-body {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.switch-label {
		font-weight: 600;
		color: var(--color-ink);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		border-top: 1px solid rgb(33 28 24 / 0.1);
		padding-top: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	textarea {
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-image);
		background-color: var(--color-cream);
		padding: 0.7rem 0.9rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--color-ink);
		resize: vertical;
	}

	button {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.8rem 1.6rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.result {
		margin-bottom: 1rem;
		border-radius: var(--radius-image);
		background-color: rgb(133 90 32 / 0.1);
		padding: 0.7rem 1rem;
		font-size: 0.875rem;
		color: var(--color-accent-strong);
	}

	.result.is-error {
		background-color: rgb(140 47 32 / 0.1);
		color: #8c2f20;
	}

	.audit {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.audit li {
		display: grid;
		gap: 0.15rem;
		border-bottom: 1px solid rgb(33 28 24 / 0.08);
		padding-bottom: 0.85rem;
		font-size: 0.875rem;
	}

	.audit-field {
		font-weight: 600;
		color: var(--color-ink);
	}

	.audit code {
		border-radius: 4px;
		background-color: var(--color-sand);
		padding: 0.05rem 0.35rem;
		font-size: 0.8125rem;
	}

	.audit time {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.empty {
		font-size: 0.9375rem;
		color: var(--color-muted);
	}

	@media (width >= 60rem) {
		.grid {
			grid-template-columns: 1.15fr 0.85fr;
		}
	}
</style>
