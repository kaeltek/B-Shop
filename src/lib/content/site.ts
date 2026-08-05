import type { SiteContent } from '$lib/types/content';

/**
 * Static site chrome. All copy here is original placeholder text written for
 * this project — replace the brand name, address and phone number with the
 * real ones before launch.
 *
 * This module exists because §8 of the spec permits section copy to come from
 * "the database or a typed content module". Navigation structure and the
 * office address are not admin-managed, so a typed module is the right home;
 * putting them in Postgres would buy nothing and cost a query per request.
 */
export const site: SiteContent = {
	brandName: 'Olive & Ember',
	brandTagline: 'Slow food, open fire',
	footerBlurb:
		'A neighbourhood kitchen cooking over wood and coals. We bake in the morning, braise through the afternoon, and keep the last table open a little later than we should.',

	nav: [
		{ label: 'Home', href: '/' },
		// No `children` here by design — shop categories are admin-managed and
		// are merged in from the database, not hardcoded. See NavLink docs.
		{ label: 'Shop', href: '/shop' },
		{ label: 'Menu', href: '/menu' },
		{
			label: 'About',
			href: '/about',
			children: [
				{ label: 'Our Story', href: '/about' },
				{ label: 'Gallery', href: '/gallery' }
			]
		},
		{ label: 'Contact', href: '/contact' }
	],

	footerColumns: [
		{
			heading: 'Explore',
			links: [
				{ label: 'Shop', href: '/shop' },
				{ label: 'Menu', href: '/menu' },
				{ label: 'Gallery', href: '/gallery' },
				{ label: 'Our Story', href: '/about' }
			]
		},
		{
			heading: 'Visit',
			links: [
				{ label: 'Book a Table', href: '/contact' },
				{ label: 'Private Events', href: '/contact' },
				{ label: 'Catering', href: '/contact' }
			]
		}
	],

	social: [
		{ label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
		{ label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
		{ label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' }
	],

	contact: {
		addressLines: ['14 Kilnwright Lane', 'Stokes Croft', 'Bristol BS1 3PR'],
		phone: '+441179000000',
		phoneDisplay: '+44 117 900 0000',
		email: 'hello@oliveandember.test',
		hours: ['Tue – Thu  ·  8:00 — 22:00', 'Fri – Sat  ·  8:00 — 23:30', 'Sun  ·  9:00 — 16:00']
	}
};
