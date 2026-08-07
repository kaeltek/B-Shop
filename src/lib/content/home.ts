import type { HomeContent } from '$lib/types/home';

/**
 * Homepage copy. Original text written for this project — no copy, imagery or
 * asset from the reference site (§7, §11).
 *
 * Sections receive this as props from `+page.svelte`; none of them import it,
 * so moving it into Postgres later is a change to one load function.
 */
export const home: HomeContent = {
	/**
	 * One slide per photograph in `static/hero-images/` — no slide is a repeat
	 * of another image with different words on it.
	 *
	 * Only pre-encoded `.webp` variants live there; the originals they came from
	 * are in `assets/hero-images/`, outside `static/` so they are versioned but
	 * never copied into the build. Each variant was encoded with sharp (quality
	 * 86), stopping at the source's own width so nothing is upscaled — the same
	 * settings `scripts/encode-gallery.mjs` applies to the gallery. Regenerate
	 * them if the source art changes.
	 */
	hero: [
		{
			eyebrow: 'Discover, Premium Diets',
			headingLines: ['Everything you', 'need all in one place'],
			ctaLabel: 'Shop the range',
			ctaHref: '/shop',
			image: {
				src: '/hero-images/hero-pantry-1168.webp',
				srcset:
					'/hero-images/hero-pantry-640.webp 640w, /hero-images/hero-pantry-960.webp 960w, /hero-images/hero-pantry-1168.webp 1168w',
				alt: 'Pouches, jars and cartons of snacks, nuts, cereals and dried fruit arranged together',
				width: 1168,
				height: 657,
				// Centred: the goods fill the frame edge to edge.
				focus: '50% 50%'
			}
		},
		{
			eyebrow: 'Stock Up',
			headingLines: ['Snack Better', 'Package Smarter'],
			ctaLabel: 'Talk to us',
			ctaHref: '/contact',
			image: {
				src: '/hero-images/hero-packaging-1584.webp',
				srcset:
					'/hero-images/hero-packaging-640.webp 640w, /hero-images/hero-packaging-960.webp 960w, /hero-images/hero-packaging-1280.webp 1280w, /hero-images/hero-packaging-1584.webp 1584w',
				alt: 'Stand-up pouches, paper bags and food containers from the packaging range',
				width: 1584,
				height: 672,
				// The goods sit in the right-hand third; the left is empty studio
				// backdrop. Bias the crop right so a narrow screen keeps the
				// products rather than a wall of beige.
				focus: '72% 50%'
			}
		}
	],

	intro: {
		eyebrow: 'Elevating Everyday Essentials',
		heading: 'Your Trusted Partner for Quality Food & Packaging Solutions',
		body: [
			'From delicious breakfast favorites to professional-grade food packaging solutions, we provide quality products that serve homes and businesses alike.',
			'Explore our wide range of breakfast foods, cereals, snacks, packaging materials, food containers, and business essentials—all under one roof.'
		],
		ctaLabel: 'See the gallery',
		ctaHref: '/gallery',
		imageSeed: 'intro-portrait',
		imageAlt: 'A cook turning something over the coals',
		videoLabel: 'Watch: a morning in the kitchen'
	},

	counters: [
		{ value: 112, label: 'Products available' },
		{ value: 78, label: 'Happy Customers' },
		{ value: 24, label: 'Orders processed daily' },
		{ value: 100, label: 'Quality guaranteed' }
	],

	featured: {
		eyebrow: 'From the shop',
		heading: 'Things worth taking home',
		body: 'Snacks • Breakfast Foods • Cereals • Packaging • Food Containers.'
	},

	features: {
		eyebrow: 'We Are Available Whenever You Need Us',
		heading: 'Anazing Service, longer relationships',
		body: 'At the heart of everything we do is a commitment to quality, affordability, and customer satisfaction. We take pride in offering a wide range of products that cater to the needs of our customers, ensuring that they have access to the best options available.',
		ctaLabel: 'Browse the shop',
		ctaHref: '/shop',
		stats: [
			{ value: 'Nourishing', label: 'Premium & Natural Ingredients' },
			{ value: 'Top Quality', label: 'Quality guaranteed' }
		],
		imageSeed: 'features-produce',
		imageAlt: 'A crate of produce delivered that morning'
	},

	suppliers: [
		'Snackwell Foods',
		'Breakfast Masters',
		'Delicious Delights',
		'Morning Cereals',
		'Premium Packs',
		'Healthy Storage',
	],

	catering: {
		eyebrow: 'Beyond the room',
		heading: 'We will bring the fire to you',
		body: 'Long tables, weddings, wakes and the odd birthday. We cook on site, over coals, for anywhere between twenty and two hundred.',
		ctaLabel: 'Talk to us about catering',
		ctaHref: '/contact',
		imageSeed: 'catering-fire'
	},

	// Copy only. The photographs live in `$lib/content/gallery`, shared with the
	// `/gallery` page so the two can never fall out of step.
	gallery: {
		eyebrow: 'The range',
		heading: 'Packaging and provisions, as they actually arrive'
	},

	instagram: {
		eyebrow: 'Day to day',
		heading: 'Follow along',
		handle: '@oliveandember',
		items: [
			{ seed: 'ig-1', alt: 'A loaf pulled from the oven' },
			{ seed: 'ig-2', alt: 'Coffee being weighed out' },
			{ seed: 'ig-3', alt: 'Herbs drying above the pass' },
			{ seed: 'ig-4', alt: 'A tray of buns before proving' },
			{ seed: 'ig-5', alt: 'The fire at its hottest' },
			{ seed: 'ig-6', alt: 'Jars cooling after a morning of preserving' }
		]
	}
};
