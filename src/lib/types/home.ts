/**
 * Homepage section content (§8).
 *
 * A note on where this lives. §2.2 says homepage section copy comes from the
 * database; §8 says it comes from "the database or a typed content module"; and
 * §10's definition of done asks only that no section copy be "hardcoded in a
 * component". Two of those three permit a module, and §8 is the most specific
 * statement about the homepage, so this is a typed module.
 *
 * Everything with real editorial weight — products, prices, images, categories
 * — already comes from Postgres. If you want this copy admin-editable too, it
 * migrates to a `home_sections` table without touching any component: the
 * sections take their content as props and never import this file directly.
 */

/**
 * A real photograph behind a hero slide, in every size it ships at.
 *
 * Unlike product imagery this is editorial and static, so it lives in
 * `static/hero-images/` and is referenced by path rather than coming from
 * `product_images` via /media. Variants are pre-encoded WebP — see the note
 * above `home.hero`.
 */
export interface HeroImage {
	/** Widest variant. The fallback for anything that ignores `srcset`. */
	src: string;
	/** Every variant with its intrinsic width, narrowest first. */
	srcset: string;
	alt: string;
	/** Intrinsic size of `src`, so the browser can reserve space. */
	width: number;
	height: number;
	/**
	 * `object-position` for the cover crop. Both photographs are wide, and a
	 * portrait phone crops most of that width away — this keeps each one's
	 * subject in frame instead of centring on whatever happens to be middle.
	 */
	focus: string;
}

export interface HeroSlide {
	eyebrow: string;
	/** Two lines, broken deliberately (§7.2). */
	headingLines: [string, string];
	ctaLabel: string;
	ctaHref: string;
	image: HeroImage;
}

/**
 * A supplied section photograph, in every size it ships at.
 *
 * `src` is the original in `static/homepage-images/` — the file the client
 * handed over, and still the `<img>` fallback. `webpSrcset` lists the variants
 * `scripts/encode-homepage.mjs` writes beside it, which is what every browser
 * released this decade actually downloads. Re-run that script after replacing a
 * source and paste its manifest over the fields below.
 */
export interface SectionImage {
	src: string;
	/** Every pre-encoded WebP variant with its intrinsic width, narrowest first. */
	webpSrcset: string;
	/** Empty when the image is decorative — a backdrop behind its own copy. */
	alt: string;
	/** Intrinsic size of `src`, so the browser can reserve space. */
	width: number;
	height: number;
}

/**
 * One tile in the strip that closes the homepage (§8.12).
 *
 * Built from a product's own `product_images` row, so the strip shows the
 * catalogue rather than artwork standing in for it.
 */
export interface StripTile {
	/** The image row's id — stable, and unique even if two products share art. */
	id: string;
	src: string;
	srcset: string;
	alt: string;
}

export interface CounterItem {
	value: number;
	suffix?: string;
	label: string;
}

export interface StatBlock {
	value: string;
	label: string;
}

/**
 * A gallery photograph, in every size it ships at.
 *
 * Like the hero imagery this is editorial and static, so it lives in
 * `static/gallery/` and is referenced by path rather than coming from
 * `product_images` via /media. See `$lib/content/gallery` for the set itself
 * and the script that encodes the variants.
 */
export interface GalleryImage {
	/** Stable identity — the `{#each}` key and the lightbox's handle on a tile. */
	id: string;
	/** Widest variant. The fallback for anything that ignores `srcset`. */
	src: string;
	/** Every variant with its intrinsic width, narrowest first. */
	srcset: string;
	alt: string;
	/** Intrinsic size of `src`, so the browser can reserve space. */
	width: number;
	height: number;
}

export interface IntroContent {
	eyebrow: string;
	heading: string;
	body: string[];
	ctaLabel: string;
	ctaHref: string;
	image: SectionImage;
	videoLabel: string;
	/**
	 * Source for the video lightbox (§8.3). The play button renders only when
	 * this is set — a play button that opens an empty player is worse than no
	 * play button. Supply a file and the whole affordance appears.
	 */
	videoUrl?: string;
}

export interface FeaturesContent {
	eyebrow: string;
	heading: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	stats: StatBlock[];
	image: SectionImage;
}

export interface CateringContent {
	eyebrow: string;
	heading: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	image: SectionImage;
}

export interface SectionIntro {
	eyebrow: string;
	heading: string;
	body?: string;
}

export interface HomeContent {
	hero: HeroSlide[];
	intro: IntroContent;
	counters: CounterItem[];
	featured: SectionIntro;
	features: FeaturesContent;
	/** Six supplier marks (§8.7). Names only — drawn as wordmarks, not images. */
	suppliers: string[];
	catering: CateringContent;
	/** Copy only — the photographs themselves come from `$lib/content/gallery`. */
	gallery: SectionIntro;
	instagram: SectionIntro & { handle: string; items: { seed: string; alt: string }[] };
}
