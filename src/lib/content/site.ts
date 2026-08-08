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
	brandName: 'B-Shop',
	brandTagline: 'Stock Up. Snack Better. Package Smarter',
	footerBlurb:
		'From delicious snacks and breakfast favorites to professional-grade food packaging solutions, we provide quality products that meet the needs of both households and businesses.',

	nav: [
		{ label: 'Home', href: '/' },
		// No `children` here by design — shop categories are admin-managed and
		// are merged in from the database, not hardcoded. See NavLink docs.
		// `/shop` stays the item's own destination either way: the dropdown is a
		// shortcut into a filtered view, never the only way in.
		{ label: 'Shop', href: '/shop' },
		{ label: 'Gallery', href: '/gallery' },
		{ label: 'Contact', href: '/contact' }
	],

	footerColumns: [
		{
			heading: 'Explore',
			links: [
				{ label: 'Shop', href: '/shop' },
				{ label: 'Gallery', href: '/gallery' },
				{ label: 'Contact', href: '/contact' }
			]
		},
		{
			heading: 'Visit',
			links: [
				{ label: 'Order', href: '/contact' },
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
		// Eurozone, to match the schema's default currency of EUR (§5).
		addressLines: ['Adenta, Greater Accra, Ghana'],
		phone: '+233 24 609 6891',
		phoneDisplay: '+233 24 609 6891',
		email: 'info@bshop.cc',
		hours: ['Tue – Thu  ·  8:00 — 22:00', 'Fri – Sat  ·  8:00 — 23:30', 'Sun  ·  9:00 — 16:00']
	}
};
