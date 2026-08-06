<script lang="ts">
	import { enhance } from '$app/forms';
	import { mediaUrl } from '$lib/utils/media';
	import type { ProductImage } from '$lib/types/catalogue';

	/**
	 * Image manager (§6): drag to reorder, click to set primary, inline alt-text
	 * editing, delete with confirmation.
	 *
	 * Reordering is optimistic — the list moves immediately and only then asks
	 * the server. `images` is re-derived from server data on every load, so a
	 * failed save rolls the order back on its own rather than needing a
	 * hand-written undo path.
	 *
	 * Every drag action has a button equivalent. Drag-and-drop is unreachable
	 * by keyboard, and §10 requires this screen to be fully traversable.
	 */
	interface Props {
		images: ProductImage[];
		busy?: boolean;
	}

	let { images, busy = false }: Props = $props();

	let dragIndex = $state<number | null>(null);
	let confirming = $state<string | null>(null);

	/**
	 * The optimistic order, as ids. Null means "whatever the server says".
	 *
	 * Holding an override rather than a copy of the list is what makes the
	 * rollback automatic: if the set of images changes underneath — an upload
	 * lands, a delete succeeds — the override no longer matches and is
	 * discarded, so fresh server data always wins without an effect to sync it.
	 */
	let overrideOrder = $state<string[] | null>(null);

	const rows = $derived.by(() => {
		if (!overrideOrder) return images;

		const byId = new Map(images.map((image) => [image.id, image]));
		const ordered = overrideOrder
			.map((id) => byId.get(id))
			.filter((image): image is ProductImage => image !== undefined);

		return ordered.length === images.length ? ordered : images;
	});

	const order = $derived(rows.map((row) => row.id).join(','));
	const dirty = $derived(order !== images.map((image) => image.id).join(','));

	function move(from: number, to: number) {
		if (to < 0 || to >= rows.length) return;
		const next = [...rows];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		overrideOrder = next.map((row) => row.id);
	}
</script>

<section class="manager">
	<header class="head">
		<h2>Images</h2>
		{#if dirty}
			<form method="POST" action="?/reorderImages" use:enhance>
				<input type="hidden" name="order" value={order} />
				<button type="submit" class="primary" disabled={busy}>Save order</button>
				<button type="button" class="ghost" onclick={() => (overrideOrder = null)}>Discard</button>
			</form>
		{/if}
	</header>

	{#if rows.length === 0}
		<p class="empty">No images yet. Upload one below.</p>
	{:else}
		<ul class="grid">
			{#each rows as image, i (image.id)}
				<li
					class="card"
					class:is-dragging={dragIndex === i}
					draggable="true"
					ondragstart={() => (dragIndex = i)}
					ondragend={() => (dragIndex = null)}
					ondragover={(e) => e.preventDefault()}
					ondrop={(e) => {
						e.preventDefault();
						if (dragIndex !== null) move(dragIndex, i);
						dragIndex = null;
					}}
				>
					<div class="thumb">
						<img src={mediaUrl(image.storageKey)} alt={image.altText || 'Product image'} />
						{#if image.isPrimary}<span class="badge">Primary</span>{/if}
					</div>

					<div class="meta">
						<span class="dims">{image.width}×{image.height}</span>

						<div class="move">
							<button type="button" onclick={() => move(i, i - 1)} disabled={i === 0}>
								<span aria-hidden="true">↑</span><span class="sr-only">Move earlier</span>
							</button>
							<button type="button" onclick={() => move(i, i + 1)} disabled={i === rows.length - 1}>
								<span aria-hidden="true">↓</span><span class="sr-only">Move later</span>
							</button>
						</div>
					</div>

					<form method="POST" action="?/altText" use:enhance class="alt">
						<input type="hidden" name="imageId" value={image.id} />
						<label class="sr-only" for="alt-{image.id}">Alt text</label>
						<input
							id="alt-{image.id}"
							name="altText"
							type="text"
							value={image.altText}
							placeholder="Describe this image"
							class:is-missing={image.altText.trim() === ''}
						/>
						<button type="submit" disabled={busy}>Save</button>
					</form>

					{#if image.altText.trim() === ''}
						<p class="warn">Required before this product can be published.</p>
					{/if}

					<div class="row-actions">
						{#if !image.isPrimary}
							<form method="POST" action="?/primary" use:enhance>
								<input type="hidden" name="imageId" value={image.id} />
								<button type="submit" class="link" disabled={busy}>Make primary</button>
							</form>
						{/if}

						{#if confirming === image.id}
							<form method="POST" action="?/deleteImage" use:enhance class="confirm">
								<input type="hidden" name="imageId" value={image.id} />
								<span>Delete?</span>
								<button type="submit" class="link danger" disabled={busy}>Yes, delete</button>
								<button type="button" class="link" onclick={() => (confirming = null)}>
									Cancel
								</button>
							</form>
						{:else}
							<button type="button" class="link danger" onclick={() => (confirming = image.id)}>
								Delete
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	<form method="POST" action="?/upload" enctype="multipart/form-data" class="upload" use:enhance>
		<div class="upload-fields">
			<label class="field">
				<span class="label">Add an image</span>
				<input
					name="file"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					required
				/>
			</label>

			<label class="field">
				<span class="label">Alt text</span>
				<input name="altText" type="text" placeholder="Describe the image" />
			</label>

			<button type="submit" class="primary" disabled={busy}>Upload</button>
		</div>
		<p class="hint">
			JPEG, PNG, WebP or AVIF, up to 8 MB. Re-encoded to WebP at three widths; EXIF, including any
			GPS location from a phone, is stripped.
		</p>
	</form>
</section>

<style>
	.manager {
		border-radius: var(--radius-card);
		background-color: var(--color-cream);
		padding: 1.75rem;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.head h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.head form {
		display: flex;
		gap: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 1rem;
		margin: 0 0 1.5rem;
		padding: 0;
		list-style: none;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		border: 1px solid rgb(33 28 24 / 0.12);
		border-radius: var(--radius-image);
		padding: 0.75rem;
		cursor: grab;
	}

	.card.is-dragging {
		opacity: 0.4;
	}

	.thumb {
		position: relative;
		aspect-ratio: 10 / 11;
		overflow: hidden;
		border-radius: calc(var(--radius-image) - 4px);
		background-color: var(--color-sand);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.badge {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.15rem 0.6rem;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-ink);
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.move {
		display: flex;
		gap: 0.25rem;
	}

	.move button {
		border: 1px solid rgb(33 28 24 / 0.2);
		border-radius: var(--radius-pill);
		background: none;
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.move button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.alt {
		display: flex;
		gap: 0.35rem;
	}

	.alt input {
		flex: 1;
		min-width: 0;
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-pill);
		padding: 0.4rem 0.75rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
	}

	.alt input.is-missing {
		border-color: rgb(192 138 62 / 0.8);
		background-color: rgb(192 138 62 / 0.1);
	}

	.alt button {
		border: 1px solid rgb(33 28 24 / 0.2);
		border-radius: var(--radius-pill);
		background: none;
		padding: 0.35rem 0.7rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}

	.warn {
		font-size: 0.6875rem;
		color: var(--color-accent-strong);
	}

	.row-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		border-top: 1px solid rgb(33 28 24 / 0.08);
		padding-top: 0.6rem;
	}

	.confirm {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.75rem;
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

	.upload {
		border-top: 1px solid rgb(33 28 24 / 0.1);
		padding-top: 1.5rem;
	}

	.upload-fields {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.85rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1 1 12rem;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.field input[type='text'] {
		border: 1px solid rgb(33 28 24 / 0.18);
		border-radius: var(--radius-image);
		padding: 0.6rem 0.85rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
	}

	.field input[type='file'] {
		font-size: 0.8125rem;
	}

	.primary {
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--color-accent);
		padding: 0.65rem 1.35rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
	}

	.ghost {
		border: 1px solid rgb(33 28 24 / 0.2);
		border-radius: var(--radius-pill);
		background: none;
		padding: 0.65rem 1.1rem;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}

	.hint {
		margin-top: 0.85rem;
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.empty {
		margin-bottom: 1.5rem;
		font-size: 0.9375rem;
		color: var(--color-muted);
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
