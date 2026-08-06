import type { HomeContent } from '$lib/types/home';

/**
 * Homepage copy. Original text written for this project — no copy, imagery or
 * asset from the reference site (§7, §11).
 *
 * Sections receive this as props from `+page.svelte`; none of them import it,
 * so moving it into Postgres later is a change to one load function.
 */
export const home: HomeContent = {
	hero: [
		{
			eyebrow: 'Open fire, open door',
			headingLines: ['Everything here', 'is cooked over wood'],
			ctaLabel: 'See the menu',
			ctaHref: '/menu',
			imageSeed: 'hero-hearth',
			imageAlt: 'The open hearth at the back of the kitchen, mid-service'
		},
		{
			eyebrow: 'Baked before six',
			headingLines: ['The bread is out', 'by the time you wake'],
			ctaLabel: 'Shop the bakery',
			ctaHref: '/shop',
			imageSeed: 'hero-bakery',
			imageAlt: 'Loaves cooling on a rack beside the oven'
		},
		{
			eyebrow: 'Twelve seats, one sitting',
			headingLines: ['Dinner is slow', 'and that is the point'],
			ctaLabel: 'Find us',
			ctaHref: '/contact',
			imageSeed: 'hero-table',
			imageAlt: 'The long communal table laid for an evening service'
		}
	],

	intro: {
		eyebrow: 'Our kitchen',
		heading: 'A small room that smells of smoke and butter',
		body: [
			'We opened in a former ironmonger’s with a hearth where the counter used to be, because everything we wanted to cook needed live fire and none of it needed a menu that changed every week.',
			'What arrives that morning decides what we serve that evening. It makes ordering harder and cooking better.'
		],
		ctaLabel: 'Read our story',
		ctaHref: '/about',
		imageSeed: 'intro-portrait',
		imageAlt: 'A cook turning something over the coals',
		videoLabel: 'Watch: a morning in the kitchen'
	},

	counters: [
		{ value: 11, label: 'Years on this corner' },
		{ value: 36, suffix: 'h', label: 'Sourdough ferment' },
		{ value: 24, label: 'Growers we buy from' },
		{ value: 12, label: 'Seats at the table' }
	],

	featured: {
		eyebrow: 'From the shop',
		heading: 'Things worth taking home',
		body: 'The same bread, coffee and preserves we use in the kitchen, in the sizes we buy them.'
	},

	features: {
		eyebrow: 'Why it tastes like this',
		heading: 'Fewer suppliers, longer relationships',
		body: 'We buy from two dozen growers and roasters, most of them within a morning’s drive. It costs more than a wholesaler and it means the menu bends around whatever they have had a good year with. We think that trade is obvious.',
		ctaLabel: 'Meet the growers',
		ctaHref: '/about',
		stats: [
			{ value: '90km', label: 'Average distance from our door to the field' },
			{ value: '2 daily', label: 'Bakes, morning and afternoon' }
		],
		imageSeed: 'features-produce',
		imageAlt: 'A crate of produce delivered that morning'
	},

	suppliers: [
		'Ashgrove Mill',
		'Coldwater Dairy',
		'Rookery Farm',
		'Hallow & Sons',
		'Pitalito Coffee',
		'Wildacre Bees'
	],

	catering: {
		eyebrow: 'Beyond the room',
		heading: 'We will bring the fire to you',
		body: 'Long tables, weddings, wakes and the odd birthday. We cook on site, over coals, for anywhere between twenty and two hundred.',
		ctaLabel: 'Talk to us about catering',
		ctaHref: '/contact',
		imageSeed: 'catering-fire'
	},

	gallery: {
		eyebrow: 'The room',
		heading: 'Somewhere between a bakery and a dining room',
		items: [
			{ seed: 'gallery-1', alt: 'Morning light across the empty counter', shape: 'tall' },
			{ seed: 'gallery-2', alt: 'Dough being shaped on a floured bench', shape: 'square' },
			{ seed: 'gallery-3', alt: 'The hearth banked up before service', shape: 'wide' },
			{ seed: 'gallery-4', alt: 'Preserves lined along a shelf', shape: 'square' },
			{ seed: 'gallery-5', alt: 'A plate going out to the pass', shape: 'tall' },
			{ seed: 'gallery-6', alt: 'The dining room at the end of the night', shape: 'wide' }
		]
	},

	newsletter: {
		eyebrow: 'Once a month',
		heading: 'What we are cooking, and when the good stuff lands',
		body: 'One email a month. Menu changes, bakery drops, the week the Seville oranges arrive. Nothing else.',
		consentLabel:
			'I agree to receive occasional emails and understand I can unsubscribe at any time.'
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
