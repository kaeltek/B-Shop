/**
 * Copy for the standalone public pages. Original text, same reasoning as
 * `home.ts` — sections take content as props, nothing imports this directly
 * except the route that owns the page.
 */

export interface PageIntro {
	eyebrow: string;
	title: string;
	standfirst: string;
}

export const shopPage = {
	intro: {
		eyebrow: 'The shop',
		title: 'Everything we sell to take home',
		standfirst:
			'Snacks, breakfast foods and cereals for the cupboard, and the pouches, bags and containers we supply to businesses. Filter by category.'
	} satisfies PageIntro
};

export const galleryPage = {
	intro: {
		eyebrow: 'The range',
		title: 'Explore Our Range, Of Products and Packaging',
		standfirst:
			'Pouches, jars, sacks and the provisions that go in them — the packaging range and the breakfast foods, snacks and cereals.'
	} satisfies PageIntro
};

export const contactPage = {
	intro: {
		eyebrow: 'Get in touch',
		title: 'Call Us, or Message Us Directly',
		standfirst:
			'For catering and private events, just call us and tell us the date, the number and roughly what you had in mind.'
	} satisfies PageIntro
};
