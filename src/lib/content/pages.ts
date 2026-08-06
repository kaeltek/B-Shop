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

export const aboutPage = {
	intro: {
		eyebrow: 'Our story',
		title: 'We took the ironmonger’s and left the chimney',
		standfirst:
			'Eleven years ago this was a hardware shop with a flue running up the back wall. We kept the flue, put a hearth under it, and have been cooking over wood ever since.'
	} satisfies PageIntro,
	body: [
		{
			heading: 'The fire came first',
			text: 'Most kitchens are designed around a menu. Ours was designed around a hearth, and the menu has been negotiating with it ever since. Live fire is impatient and inconsistent: it runs hot at seven and sulks by ten, and nothing about it can be set to 180°C and forgotten. It also does things to a shoulder of pork that an oven cannot, which is why we put up with the rest.'
		},
		{
			heading: 'Then the growers',
			text: 'We buy from about two dozen people, most within a morning’s drive, and we buy what they have rather than what we planned. It costs more than a wholesaler and it makes the menu harder to write. It also means that when the Seville oranges land in January we get the first crate, because we have taken the last one every year for a decade.'
		},
		{
			heading: 'Then the room',
			text: 'Twelve seats at one long table, one sitting an evening. It is not a concept, it is the size of the room. What it does mean is that dinner takes as long as it takes, people end up talking to whoever they were sat beside, and we cook one menu properly instead of thirty things adequately.'
		}
	],
	values: [
		{ title: 'Nothing frozen', text: 'If it cannot be got fresh that week, it is not on.' },
		{ title: 'Whole animals', text: 'We buy whole and butcher here, so nothing good gets wasted.' },
		{ title: 'Open kitchen', text: 'You can see everything we do. That is on purpose.' },
		{ title: 'Fair hours', text: 'One sitting a night, closed Mondays. Cooks have lives.' }
	]
};

export const menuPage = {
	intro: {
		eyebrow: 'What we are cooking',
		title: 'The menu moves with the deliveries',
		standfirst:
			'This is the shop list — the bread, coffee and pantry goods we sell to take home. The evening menu is written each afternoon and read aloud at the table, because it changes too often to print.'
	} satisfies PageIntro
};

export const galleryPage = {
	intro: {
		eyebrow: 'The room',
		title: 'Mornings, service, and the quiet afterwards',
		standfirst:
			'Photographs of the kitchen, the hearth and the long table. Use the arrow keys to move between them.'
	} satisfies PageIntro
};

export const contactPage = {
	intro: {
		eyebrow: 'Get in touch',
		title: 'Come in, call, or write',
		standfirst:
			'Breakfast and lunch are walk-in. Evenings are one sitting and need booking ahead. For catering and private events, email is best — tell us the date, the number and roughly what you had in mind.'
	} satisfies PageIntro
};
