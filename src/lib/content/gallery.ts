import type { GalleryImage } from '$lib/types/home';

/**
 * The gallery photography — one source of truth for both the homepage section
 * (§8.9) and the standalone `/gallery` page, so the two never drift.
 *
 * These are real product photographs, not placeholder artwork. The sources live
 * in `assets/gallery/` (outside `static/`, so ~21MB of originals stay out of the
 * build); the `.webp` variants referenced here are pre-encoded from them by
 * `scripts/encode-gallery.mjs`. Re-run that script after adding or replacing a
 * source and paste its manifest output over the `src`/`srcset`/`width`/`height`
 * fields below — the alt text is the only part written by hand.
 *
 * Every source is square, so the grid is a uniform square grid: no tile crops
 * its subject, and the packaging in each shot survives at any breakpoint.
 */
export const galleryImages: GalleryImage[] = [
	{
		id: 'tom-brown-jar',
		src: '/gallery/tom-brown-jar-1024.webp',
		srcset:
			'/gallery/tom-brown-jar-320.webp 320w, /gallery/tom-brown-jar-640.webp 640w, /gallery/tom-brown-jar-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A jar of Tom Brown cereal blend beside groundnuts and dried corn'
	},
	{
		id: 'plantain-chips-pouch',
		src: '/gallery/plantain-chips-pouch-1024.webp',
		srcset:
			'/gallery/plantain-chips-pouch-320.webp 320w, /gallery/plantain-chips-pouch-640.webp 640w, /gallery/plantain-chips-pouch-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A pouch of crunchy plantain chips with chips scattered beside it'
	},
	{
		id: 'kraft-window-pouches',
		src: '/gallery/kraft-window-pouches-1024.webp',
		srcset:
			'/gallery/kraft-window-pouches-320.webp 320w, /gallery/kraft-window-pouches-640.webp 640w, /gallery/kraft-window-pouches-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Seven kraft paper pouches in graded sizes, each with a window showing nuts and dried fruit'
	},
	{
		id: 'hexagonal-preserve-jars',
		src: '/gallery/hexagonal-preserve-jars-1024.webp',
		srcset:
			'/gallery/hexagonal-preserve-jars-320.webp 320w, /gallery/hexagonal-preserve-jars-640.webp 640w, /gallery/hexagonal-preserve-jars-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Six hexagonal glass jars with gold lids holding preserves, olives, honey and lentils'
	},
	{
		id: 'clear-pouches-chips-and-nuts',
		src: '/gallery/clear-pouches-chips-and-nuts-1024.webp',
		srcset:
			'/gallery/clear-pouches-chips-and-nuts-320.webp 320w, /gallery/clear-pouches-chips-and-nuts-640.webp 640w, /gallery/clear-pouches-chips-and-nuts-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Two clear stand-up pouches on marble, one of plantain chips and one of groundnuts'
	},
	{
		id: 'popcorn-bags',
		src: '/gallery/popcorn-bags-1024.webp',
		srcset:
			'/gallery/popcorn-bags-320.webp 320w, /gallery/popcorn-bags-640.webp 640w, /gallery/popcorn-bags-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Printed popcorn bags with popcorn spilling onto the counter beside them'
	},
	{
		id: 'black-window-pouches-muesli',
		src: '/gallery/black-window-pouches-muesli-1024.webp',
		srcset:
			'/gallery/black-window-pouches-muesli-320.webp 320w, /gallery/black-window-pouches-muesli-640.webp 640w, /gallery/black-window-pouches-muesli-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Five matte black stand-up pouches in graded sizes, each with a window showing muesli'
	},
	{
		id: 'woven-carrier-bag-bread',
		src: '/gallery/woven-carrier-bag-bread-1024.webp',
		srcset:
			'/gallery/woven-carrier-bag-bread-320.webp 320w, /gallery/woven-carrier-bag-bread-640.webp 640w, /gallery/woven-carrier-bag-bread-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A woven carrier bag of bread rolls on a marble counter'
	},
	{
		id: 'clear-pouches-grains-and-beans',
		src: '/gallery/clear-pouches-grains-and-beans-1024.webp',
		srcset:
			'/gallery/clear-pouches-grains-and-beans-320.webp 320w, /gallery/clear-pouches-grains-and-beans-640.webp 640w, /gallery/clear-pouches-grains-and-beans-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Five clear stand-up pouches holding mung beans, red beans, groundnuts and millet'
	},
	{
		id: 'silver-pouches-legumes',
		src: '/gallery/silver-pouches-legumes-1024.webp',
		srcset:
			'/gallery/silver-pouches-legumes-320.webp 320w, /gallery/silver-pouches-legumes-640.webp 640w, /gallery/silver-pouches-legumes-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Three silver-backed pouches of groundnuts, soya beans and couscous on a serving board'
	},
	{
		id: 'kraft-bread-bag',
		src: '/gallery/kraft-bread-bag-1024.webp',
		srcset:
			'/gallery/kraft-bread-bag-320.webp 320w, /gallery/kraft-bread-bag-640.webp 640w, /gallery/kraft-bread-bag-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A kraft paper bag with a clear window, holding a loaf of bread'
	},
	{
		id: 'black-pouches-dried-goods',
		src: '/gallery/black-pouches-dried-goods-1024.webp',
		srcset:
			'/gallery/black-pouches-dried-goods-320.webp 320w, /gallery/black-pouches-dried-goods-640.webp 640w, /gallery/black-pouches-dried-goods-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Four black window pouches holding goji berries, sweets, pumpkin seeds and dried corn'
	},
	{
		id: 'red-window-pouch-snacks',
		src: '/gallery/red-window-pouch-snacks-1024.webp',
		srcset:
			'/gallery/red-window-pouch-snacks-320.webp 320w, /gallery/red-window-pouch-snacks-640.webp 640w, /gallery/red-window-pouch-snacks-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A red stand-up pouch with a window, filled with crunchy baked snacks'
	},
	{
		id: 'handled-box-pouches',
		src: '/gallery/handled-box-pouches-1024.webp',
		srcset:
			'/gallery/handled-box-pouches-320.webp 320w, /gallery/handled-box-pouches-640.webp 640w, /gallery/handled-box-pouches-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Three clear box pouches with carry handles, holding dried mushrooms, walnuts and grains'
	},
	{
		id: 'spouted-liquid-pouches',
		src: '/gallery/spouted-liquid-pouches-1024.webp',
		srcset:
			'/gallery/spouted-liquid-pouches-320.webp 320w, /gallery/spouted-liquid-pouches-640.webp 640w, /gallery/spouted-liquid-pouches-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'Silver spouted pouches for liquids, shown in three sizes'
	},
	{
		id: 'matte-silver-pouch-sizes',
		src: '/gallery/matte-silver-pouch-sizes-1024.webp',
		srcset:
			'/gallery/matte-silver-pouch-sizes-320.webp 320w, /gallery/matte-silver-pouch-sizes-640.webp 640w, /gallery/matte-silver-pouch-sizes-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A range of matte silver stand-up pouches, the largest labelled twenty by thirty centimetres'
	},
	{
		id: 'vacuum-pack-chickpeas-styled',
		src: '/gallery/vacuum-pack-chickpeas-styled-1024.webp',
		srcset:
			'/gallery/vacuum-pack-chickpeas-styled-320.webp 320w, /gallery/vacuum-pack-chickpeas-styled-640.webp 640w, /gallery/vacuum-pack-chickpeas-styled-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A vacuum pack of chickpeas beside a small bowl and a sprig of rosemary'
	},
	{
		id: 'vacuum-pack-chickpeas',
		src: '/gallery/vacuum-pack-chickpeas-1024.webp',
		srcset:
			'/gallery/vacuum-pack-chickpeas-320.webp 320w, /gallery/vacuum-pack-chickpeas-640.webp 640w, /gallery/vacuum-pack-chickpeas-1024.webp 1024w',
		width: 1024,
		height: 1021,
		alt: 'A clear vacuum pack of chickpeas against a plain backdrop'
	},
	{
		id: 'rice-sack-with-handle',
		src: '/gallery/rice-sack-with-handle-1024.webp',
		srcset:
			'/gallery/rice-sack-with-handle-320.webp 320w, /gallery/rice-sack-with-handle-640.webp 640w, /gallery/rice-sack-with-handle-1024.webp 1024w',
		width: 1024,
		height: 1024,
		alt: 'A sack of rice fitted with a moulded carry handle'
	}
];

/**
 * The subset the homepage shows — two full rows at the four-column desktop
 * maximum, four rows on a phone. The same images, in the same order, as the
 * opening of `/gallery`, so the page reads as more of what you already saw.
 */
export const homeGalleryImages: GalleryImage[] = galleryImages.slice(0, 8);
