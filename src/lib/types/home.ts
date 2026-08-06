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

export interface HeroSlide {
	eyebrow: string;
	/** Two lines, broken deliberately (§7.2). */
	headingLines: [string, string];
	ctaLabel: string;
	ctaHref: string;
	imageSeed: string;
	imageAlt: string;
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

export interface GalleryItem {
	seed: string;
	alt: string;
	/** Drives the masonry span (§8.9 — asymmetric, not a uniform grid). */
	shape: 'tall' | 'wide' | 'square';
}

export interface IntroContent {
	eyebrow: string;
	heading: string;
	body: string[];
	ctaLabel: string;
	ctaHref: string;
	imageSeed: string;
	imageAlt: string;
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
	imageSeed: string;
	imageAlt: string;
}

export interface CateringContent {
	eyebrow: string;
	heading: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	imageSeed: string;
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
	gallery: SectionIntro & { items: GalleryItem[] };
	newsletter: {
		eyebrow: string;
		heading: string;
		body: string;
		consentLabel: string;
	};
	instagram: SectionIntro & { handle: string; items: { seed: string; alt: string }[] };
}
