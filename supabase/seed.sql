-- ---------------------------------------------------------------------------
-- Sample catalogue data.
--
-- Idempotent: every statement is ON CONFLICT DO NOTHING keyed on the natural
-- slug, so re-running this is safe and will not duplicate rows.
--
-- `supabase db reset` runs this automatically against a local stack. Against a
-- hosted project, run it explicitly:
--     npx supabase db push                 # schema
--     psql "$DATABASE_URL" -f supabase/seed.sql
--
-- No product_images rows are seeded. An image row without the matching object
-- in storage renders a broken image on the storefront, and there is nothing to
-- upload from a SQL file. Add images through the admin console (P5).
-- ---------------------------------------------------------------------------

insert into public.categories (slug, name, description, sort_order) values
	('bakery',    'Bakery',    'Baked each morning on a stone hearth. Long ferments, dark crusts.',        10),
	('pantry',    'Pantry',    'The dry goods we cook with, in the same sizes we buy them.',                20),
	('coffee',    'Coffee',    'Roasted in small batches for filter and espresso.',                         30),
	('preserves', 'Preserves', 'Whatever the season gave us, put up in jars before it went.',               40)
on conflict (slug) do nothing;

insert into public.products
	(slug, name, summary, description, price_cents, currency, category_id, is_published, is_available, sort_order)
values
	(
		'sourdough-miche',
		'Sourdough Miche',
		'A 1.4kg wheel, 36-hour ferment, blistered crust.',
		'Stoneground wheat and a little rye, fermented for thirty-six hours and baked dark against the hearth. The crumb is open and faintly sour; the crust is thick enough to argue with. Keeps four days cut-side down on a board, and makes better toast on day three than day one.',
		1400, 'EUR', (select id from public.categories where slug = 'bakery'), true, true, 10
	),
	(
		'rye-caraway-loaf',
		'Rye & Caraway Loaf',
		'Dense, dark and faintly aniseed. Cut it thin.',
		'Seventy percent rye, toasted caraway through the crumb, baked in a tin and left a full day before it goes out. Dense enough that a thin slice is the right slice. Built for cured fish, sharp cheese and butter with salt in it.',
		950, 'EUR', (select id from public.categories where slug = 'bakery'), true, true, 20
	),
	(
		'cardamom-buns',
		'Cardamom Buns',
		'Six to a box, hand-ground pods, pearl sugar.',
		'We grind the pods the same morning, which is the whole trick — pre-ground cardamom loses its top notes within hours. Laminated dough, knotted by hand, brushed with syrup and finished with pearl sugar. Best within a day, warm, with nothing on them.',
		1200, 'EUR', (select id from public.categories where slug = 'bakery'), true, true, 30
	),
	(
		'olive-oil-focaccia',
		'Olive Oil Focaccia',
		'Dimpled, generous with oil, rosemary and flaked salt.',
		'A slow, wet dough left overnight, pressed into the tray by hand and flooded with more olive oil than feels reasonable. Rosemary from the yard, flaked salt on top. The underside fries in the oil as it bakes, which is the part people come back for.',
		800, 'EUR', (select id from public.categories where slug = 'bakery'), true, true, 40
	),
	(
		'wild-fennel-pollen',
		'Wild Fennel Pollen',
		'20g jar. Sweet, floral and startlingly strong.',
		'Collected from wild fennel heads and dried whole. A pinch does the work of a spoonful of seed — sweet and floral rather than sharp. We use it on pork, on roast squash, and stirred into oil for bread.',
		1650, 'EUR', (select id from public.categories where slug = 'pantry'), true, true, 10
	),
	(
		'smoked-sea-salt',
		'Smoked Sea Salt',
		'Cold-smoked over oak for three days. 150g.',
		'Flaked sea salt, cold-smoked over oak until it takes on colour and a genuine campfire smell. Cold-smoking keeps the crystal structure intact, so it still shatters between your fingers. Finishing salt only — the smoke is wasted in a boiling pot.',
		900, 'EUR', (select id from public.categories where slug = 'pantry'), true, true, 20
	),
	(
		'hand-rolled-pici',
		'Hand-rolled Pici',
		'500g. Thick, uneven, exactly as intended.',
		'Flour, water, a little oil, rolled out by hand one length at a time. No egg and no extruder, so every strand is a slightly different thickness and the sauce catches accordingly. Dried slowly over two days. Nine minutes, well-salted water.',
		750, 'EUR', (select id from public.categories where slug = 'pantry'), true, true, 30
	),
	(
		'house-espresso',
		'House Espresso Blend',
		'250g. Brazil and Ethiopia. Cocoa, plum, brown sugar.',
		'Two-thirds washed Brazilian for body and cocoa, one-third natural Ethiopian for the plum note on the finish. Roasted a shade past first crack — dark enough for milk, not so dark it gives up its fruit. Rested four days before it ships.',
		1350, 'EUR', (select id from public.categories where slug = 'coffee'), true, true, 10
	),
	(
		'single-origin-huila',
		'Single Origin Filter — Huila',
		'250g. Washed Colombian. Red apple, cane sugar, jasmine.',
		'From smallholder lots around Pitalito, washed and dried on raised beds. Roasted light for filter: red apple acidity up front, cane sugar in the middle, a jasmine note as it cools. Give it a coarser grind and cooler water than you think.',
		1550, 'EUR', (select id from public.categories where slug = 'coffee'), true, true, 20
	),
	(
		'seville-marmalade',
		'Seville Marmalade',
		'340g. Bitter, dark-set, cut thick.',
		'Seville oranges for the six weeks a year they exist, cut thick and set dark. Properly bitter — we hold back the sugar so the peel still tastes of peel. One batch a year; when it is gone it is gone until January.',
		700, 'EUR', (select id from public.categories where slug = 'preserves'), true, true, 10
	),
	(
		'fig-star-anise-jam',
		'Fig & Star Anise Jam',
		'340g. Whole fruit, loose set, one star anise per jar.',
		'Late figs cooked whole and slow so the fruit stays in pieces, with a single star anise left in each jar to keep infusing on the shelf. Loose-set on purpose. For cheese far more than for toast.',
		780, 'EUR', (select id from public.categories where slug = 'preserves'), true, true, 20
	),
	(
		'preserved-lemons',
		'Preserved Lemons',
		'500g jar. Salt-cured eight weeks. Use the peel, not the flesh.',
		'Thin-skinned lemons quartered, packed in their own juice with coarse salt and left eight weeks until the peel goes soft and translucent. Rinse, discard the flesh, chop the peel fine. Transforms a chicken, a plate of lentils, or a bowl of yoghurt.',
		1100, 'EUR', (select id from public.categories where slug = 'preserves'), true, true, 30
	),
	(
		'winter-truffle-butter',
		'Winter Truffle Butter',
		'Draft — not yet published. Seasonal, arrives December.',
		'Cultured butter beaten with fresh winter truffle. Listed here unpublished so the admin console has a draft to work with: it must be visible in the admin product list and absent from the public catalogue.',
		2200, 'EUR', (select id from public.categories where slug = 'pantry'), false, true, 40
	),
	(
		'sold-out-honey',
		'Wildflower Honey',
		'This year''s crop is finished.',
		'Raw wildflower honey from hives on the eastern hills. Published but unavailable — seeded this way so the storefront has a case that is browsable and visibly out of stock, which is a different state from the whole site being gated.',
		1250, 'EUR', (select id from public.categories where slug = 'pantry'), true, false, 50
	)
on conflict (slug) do nothing;

insert into public.product_tags (product_id, tag)
select p.id, t.tag
from (values
	('sourdough-miche',      'sourdough'),
	('sourdough-miche',      'vegan'),
	('rye-caraway-loaf',     'rye'),
	('rye-caraway-loaf',     'vegan'),
	('cardamom-buns',        'sweet'),
	('cardamom-buns',        'bestseller'),
	('olive-oil-focaccia',   'vegan'),
	('wild-fennel-pollen',   'foraged'),
	('wild-fennel-pollen',   'seasonal'),
	('smoked-sea-salt',      'house-made'),
	('hand-rolled-pici',     'vegan'),
	('hand-rolled-pici',     'house-made'),
	('house-espresso',       'bestseller'),
	('single-origin-huila',  'single-origin'),
	('seville-marmalade',    'seasonal'),
	('seville-marmalade',    'house-made'),
	('fig-star-anise-jam',   'house-made'),
	('preserved-lemons',     'house-made'),
	('winter-truffle-butter','seasonal'),
	('sold-out-honey',       'raw')
) as t (slug, tag)
join public.products p on p.slug = t.slug
on conflict (product_id, tag) do nothing;
