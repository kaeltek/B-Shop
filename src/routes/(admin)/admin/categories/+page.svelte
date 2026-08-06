<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let editing = $state<string | null>(null);
	let confirming = $state<string | null>(null);

	$effect(() => {
		// Any fresh server data means the last action finished; close the forms.
		void data.categories;
		editing = null;
		confirming = null;
	});
</script>

<svelte:head><title>Categories — Admin</title></svelte:head>

<header class="head">
	<h1>Categories</h1>
	<p>Categories appear in the shop filter bar and in the site navigation.</p>
</header>

{#if form?.message}
	<p class="result" class:is-error={!form.ok} role="status">{form.message}</p>
{/if}

<div class="layout">
	<section class="panel">
		<h2>Existing</h2>

		{#if data.categories.length === 0}
			<p class="empty">No categories yet.</p>
		{:else}
			<ul class="list">
				{#each data.categories as category (category.id)}
					<li>
						{#if editing === category.id}
							<form method="POST" action="?/update" use:enhance class="edit">
								<input type="hidden" name="id" value={category.id} />
								<input name="name" type="text" value={category.name} required />
								<input
									name="description"
									type="text"
									value={category.description ?? ''}
									placeholder="Description"
								/>
								<input
									name="sortOrder"
									type="number"
									value={category.sortOrder}
									aria-label="Sort order"
								/>
								<div class="edit-actions">
									<button type="submit" class="primary">Save</button>
									<button type="button" class="link" onclick={() => (editing = null)}>
										Cancel
									</button>
								</div>
							</form>
						{:else}
							<div class="row">
								<div>
									<p class="name">{category.name}</p>
									<p class="slug">/shop?category={category.slug}</p>
									{#if category.description}<p class="desc">{category.description}</p>{/if}
								</div>

								<div class="row-meta">
									<span class="count">
										{data.counts[category.id] ?? 0}
										{(data.counts[category.id] ?? 0) === 1 ? 'product' : 'products'}
									</span>

									<button type="button" class="link" onclick={() => (editing = category.id)}>
										Edit
									</button>

									{#if confirming === category.id}
										<form method="POST" action="?/delete" use:enhance class="confirm">
											<input type="hidden" name="id" value={category.id} />
											<span>
												{#if (data.counts[category.id] ?? 0) > 0}
													{data.counts[category.id]} products will become uncategorised.
												{:else}
													Delete?
												{/if}
											</span>
											<button type="submit" class="link danger">Yes, delete</button>
											<button type="button" class="link" onclick={() => (confirming = null)}>
												Cancel
											</button>
										</form>
									{:else}
										<button
											type="button"
											class="link danger"
											onclick={() => (confirming = category.id)}
										>
											Delete
										</button>
									{/if}
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<form method="POST" action="?/create" class="panel" use:enhance>
		<h2>Add a category</h2>

		<label class="field">
			<span class="label">Name</span>
			<input name="name" type="text" required />
		</label>

		<label class="field">
			<span class="label">Slug</span>
			<input name="slug" type="text" placeholder="Generated from the name" />
			<span class="hint">Used in shop URLs. Cannot be changed afterwards.</span>
		</label>

		<label class="field">
			<span class="label">Description</span>
			<input name="description" type="text" />
		</label>

		<label class="field">
			<span class="label">Sort order</span>
			<input name="sortOrder" type="number" value="0" />
		</label>

		<button type="submit" class="primary">Add category</button>
	</form>
</div>

<style>
	.head {
		margin-bottom: 1.5rem;
	}

	.head h1 {
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.head p {
		margin-top: 0.35rem;
		font-size: 0.9375rem;
	}

	.layout {
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

	.list {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list li {
		border-top: 1px solid rgb(33 28 24 / 0.1);
		padding-block: 1rem;
	}

	.list li:first-child {
		border-top: 0;
		padding-top: 0;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.name {
		font-weight: 600;
		color: var(--color-ink);
	}

	.slug,
	.desc {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.desc {
		margin-top: 0.3rem;
		max-width: 40ch;
	}

	.row-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.85rem;
		font-size: 0.75rem;
	}

	.count {
		color: var(--color-muted);
	}

	.confirm {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}

	.edit {
		display: grid;
		gap: 0.6rem;
	}

	.edit-actions {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 1rem;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.hint {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	input {
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-image);
		background-color: var(--color-cream);
		padding: 0.6rem 0.85rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--color-ink);
	}

	.primary {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.7rem 1.4rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
	}

	.primary:hover {
		background-color: var(--color-ink);
		color: var(--color-cream);
	}

	.link {
		border: 0;
		background: none;
		padding: 0;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-accent-strong);
		cursor: pointer;
		text-decoration: underline;
	}

	.link.danger {
		color: #8c2f20;
	}

	.result {
		margin-bottom: 1rem;
		border-radius: var(--radius-image);
		background-color: rgb(133 90 32 / 0.12);
		padding: 0.7rem 1rem;
		font-size: 0.875rem;
		color: var(--color-accent-strong);
	}

	.result.is-error {
		background-color: rgb(140 47 32 / 0.1);
		color: #8c2f20;
	}

	.empty {
		font-size: 0.9375rem;
		color: var(--color-muted);
	}

	@media (width >= 64rem) {
		.layout {
			grid-template-columns: 1.4fr 0.6fr;
		}
	}
</style>
