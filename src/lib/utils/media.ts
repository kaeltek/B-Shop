/**
 * Image URL construction (§4.2).
 *
 * The database stores a driver-relative KEY. Every consumer goes through this
 * helper, so switching IMAGE_STORE between `local` and `supabase` changes zero
 * rows and zero components — the URL a component renders is identical either
 * way, and only the endpoint behind it changes.
 *
 * Never build an image src by concatenating a Supabase or CDN host onto a key.
 */

/** Widths written by the upload pipeline (§4.3 step 3). */
export const IMAGE_WIDTHS = [400, 800, 1600] as const;

/**
 * The canonical URL for a stored image.
 *
 * The `/media` endpoint arrives in P5 alongside the storage drivers. Until
 * then no product has images, so nothing requests one.
 */
export function mediaUrl(storageKey: string): string {
	return `/media/${storageKey}`;
}

/**
 * Builds a `srcset` from the variant keys the pipeline produced.
 *
 * Keys are `<base>-<width>.webp`, so the variants are derivable from any one of
 * them without another database round trip.
 */
export function mediaSrcset(storageKey: string): string {
	const base = storageKey.replace(/-\d+\.webp$/, '');
	return IMAGE_WIDTHS.map((width) => `${mediaUrl(`${base}-${width}.webp`)} ${width}w`).join(', ');
}
