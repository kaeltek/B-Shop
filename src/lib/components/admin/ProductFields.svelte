<script lang="ts">
	import type { Category } from '$lib/types/catalogue';

	/**
	 * The product form's fields, shared by create and edit so the two screens
	 * cannot drift apart.
	 */
	export interface ProductFormValues {
		name: string;
		slug: string;
		summary: string;
		description: string;
		price: string;
		currency: string;
		categoryId: string;
		tags: string;
		isPublished: boolean;
		isAvailable: boolean;
		sortOrder: number;
	}

	interface Props {
		values: ProductFormValues;
		categories: Category[];
		errors?: Record<string, string>;
		/** Hidden on create, where there are no images to caption yet. */
		allowPublish?: boolean;
		publishHint?: string;
	}

	let { values, categories, errors = {}, allowPublish = true, publishHint = '' }: Props = $props();
</script>

<div class="fields">
	<label class="field">
		<span class="label">Name</span>
		<input name="name" type="text" required value={values.name} />
		{#if errors.name}<span class="error">{errors.name}</span>{/if}
	</label>

	<label class="field">
		<span class="label">URL slug</span>
		<input name="slug" type="text" value={values.slug} placeholder="Generated from the name" />
		<span class="hint">Leave empty to build it from the name.</span>
		{#if errors.slug}<span class="error">{errors.slug}</span>{/if}
	</label>

	<label class="field">
		<span class="label">Summary</span>
		<input name="summary" type="text" value={values.summary} maxlength="200" />
		<span class="hint">One line, shown on cards.</span>
	</label>

	<label class="field span-2">
		<span class="label">Description</span>
		<textarea name="description" rows="6">{values.description}</textarea>
		<span class="hint">Long form, shown on the product page.</span>
	</label>

	<label class="field">
		<span class="label">Price</span>
		<input name="price" type="text" inputmode="decimal" value={values.price} placeholder="14.50" />
		<span class="hint">Stored as whole cents — no floating point.</span>
		{#if errors.price}<span class="error">{errors.price}</span>{/if}
	</label>

	<label class="field">
		<span class="label">Currency</span>
		<input name="currency" type="text" maxlength="3" value={values.currency} />
		{#if errors.currency}<span class="error">{errors.currency}</span>{/if}
	</label>

	<label class="field">
		<span class="label">Category</span>
		<select name="categoryId" value={values.categoryId}>
			<option value="">No category</option>
			{#each categories as category (category.id)}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</label>

	<label class="field">
		<span class="label">Tags</span>
		<input name="tags" type="text" value={values.tags} placeholder="vegan, bestseller" />
		<span class="hint">Comma separated.</span>
	</label>

	<input type="hidden" name="sortOrder" value={values.sortOrder} />

	<div class="field span-2 toggles">
		{#if allowPublish}
			<label class="toggle">
				<input type="checkbox" name="isPublished" checked={values.isPublished} />
				<span>Published — visible on the public site</span>
			</label>
		{:else if publishHint}
			<p class="hint">{publishHint}</p>
		{/if}

		<label class="toggle">
			<input type="checkbox" name="isAvailable" checked={values.isAvailable} />
			<span>In stock — independent of the commerce gate</span>
		</label>

		{#if errors.isPublished}<span class="error">{errors.isPublished}</span>{/if}
	</div>
</div>

<style>
	.fields {
		display: grid;
		gap: 1.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	input[type='text'],
	select,
	textarea {
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-image);
		background-color: var(--color-cream);
		padding: 0.65rem 0.9rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--color-ink);
	}

	textarea {
		resize: vertical;
	}

	.hint {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.error {
		font-size: 0.8125rem;
		color: #8c2f20;
	}

	.toggles {
		gap: 0.75rem;
		border-top: 1px solid rgb(33 28 24 / 0.1);
		padding-top: 1.25rem;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.9375rem;
		cursor: pointer;
	}

	.toggle input {
		width: 1.05rem;
		height: 1.05rem;
		accent-color: var(--color-accent-strong);
	}

	@media (width >= 44rem) {
		.fields {
			grid-template-columns: 1fr 1fr;
		}

		.span-2 {
			grid-column: 1 / -1;
		}
	}
</style>
