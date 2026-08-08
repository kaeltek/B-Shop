# Architecture

How this codebase is arranged, why, and how to extend the parts that are
deliberately unfinished.

---

## Module boundaries

```
src/
  lib/
    server/            NEVER imported by a component. SvelteKit enforces this.
      db/              One module per entity. The ONLY place Supabase is queried.
      storage/         Image storage drivers behind one interface.
      images/          Upload processing (sharp).
      supabase.ts      Client construction (anon + service role).
      guards.ts        assertCommerceEnabled — the commerce lock.
      rateLimit.ts     Fixed-window limiter.
      productForm.ts   Parsing/validation shared by create and edit.
    components/        Presentational. No data access, ever.
    content/           Typed copy modules (site chrome, homepage, page intros).
    types/             Domain types + CLI-generated database types.
    utils/             Pure helpers (money, media URLs, motion).
  routes/
    (site)/            Public storefront.
    (admin)/           Admin console, behind an auth + is_admin guard.
    media/[...key]/    The single public URL for every stored image.
    login/ logout/     Auth.
    sitemap.xml/ robots.txt/
```

**The one rule that matters most:** all Supabase access lives in
`src/lib/server/db/`. A `.svelte` file must never contain a query, and neither
should a `load` function — loads call a db module. This is what makes RLS
auditable: every query is in five files.

---

## Data flow

```
request
  → hooks.server.ts        builds the Supabase client (lazily) and memoises settings
  → (site)/+layout.server  settings + categories, once per request
  → +page.server.ts        calls db modules
  → +page.svelte           receives typed props, renders
```

Components receive data as props. None of them import a content module or a db
module directly, so moving copy from a typed module into Postgres is a change
to one `load` function.

---

## The commerce gate

Three independent layers, on purpose:

| Layer | Where                            | Does what                                                                                          |
| ----- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| Hook  | `hooks.server.ts`                | Refuses `COMMERCE_ROUTES` before routing. 403 for `/api/*` and mutations, 404 for page navigation. |
| Guard | `lib/server/guards.ts`           | `assertCommerceEnabled(locals)` as the first line of every cart/checkout load and endpoint.        |
| UI    | `ProductCard`, `Price`, `Header` | Renders a neutral affordance instead of a buy affordance.                                          |

The hook protects routes that forget the guard. The guard protects paths the
hook's list has not been told about. The UI is presentation only and protects
nothing — never rely on it.

**Settings are never cached across requests.** They are memoised per request on
`locals.getCommerce()`, so the gate costs one query no matter how many places
consult it, and a toggle takes effect on the very next request. Responses that
vary with the gate send `Cache-Control: private, no-store` so no CDN can serve
a commerce-on page after the shop closes.

**Adding a commerce route:** add the path to `COMMERCE_ROUTES` _and_ call
`assertCommerceEnabled` in the handler. Then add a test — `e2e/commerce-gate.e2e.ts`
is the pattern.

---

## Image storage

The database stores a **key**, never a URL:

```
products/<product-id>/<uuid>-1600.webp
```

Everything is served through `/media/[...key]`, which resolves the active driver
per request. Switching drivers therefore changes zero rows and zero components.

### Drivers

Selected by `IMAGE_STORE`:

- **`local`** — `LocalStaticStore`, writes to `static/uploads/products/`.
  **Development and `adapter-node` with a persistent volume only.** It cannot
  work on Vercel: `static/` is copied at _build_ time and the serverless
  filesystem is read-only and ephemeral. An upload would appear to succeed, then
  vanish with the instance, and would never have been visible to another
  instance anyway.
- **`supabase`** — `SupabaseStore`, writes to the public `product-images`
  bucket. **Use this for any real deployment.** `/media` 302-redirects to the
  object rather than proxying bytes through a function.

### Upload pipeline (`lib/server/images/pipeline.ts`)

1. Reject over 8 MB before reading the body.
2. Sniff magic bytes. The client `Content-Type` is a claim and is ignored.
3. `sharp(...).rotate()` — applies EXIF orientation, then re-encodes to WebP at
   400/800/1600. sharp writes no metadata unless asked, so EXIF (including phone
   GPS) does not survive. `.rotate()` must come first or photos relying on the
   orientation tag come out sideways once it is stripped.
4. Write every variant through the driver.
5. Insert the row; if that fails, delete the objects just written.

Deleting a product reads its storage keys **before** deleting the row —
`ON DELETE CASCADE` removes `product_images`, and once those are gone nothing
records which objects to clean up.

### Adding a driver

Implement `ImageStore` (`lib/server/storage/types.ts`), add a case to
`getImageStore()`. Implement `redirectUrl` if the driver has public URLs.
Call `assertSafeKey` in every method that turns a key into a path or URL.

---

## Row types

`src/lib/types/database.ts` is **generated** — do not edit it:

```
npx supabase login
npm run db:link
npm run db:push     # apply migrations
npm run db:types    # regenerate
```

`lib/server/db/rows.ts` aliases those generated types and composes the PostgREST
embeds the generator cannot express. Regenerate after every migration; a renamed
column then fails `svelte-check` instead of failing at runtime.

---

## Row level security

Every table has RLS enabled. Every write policy calls `is_admin()`.

`is_admin()` is `SECURITY DEFINER` because `admin_users` has RLS on — a plain
function called from another table's policy would recurse into `admin_users`'
own policy and evaluate false for everyone. `search_path` is pinned so the
lookup cannot be shadowed.

Reads are public where the data already is (categories, settings, published
products). Tags and images inherit their product's visibility, so a draft
cannot leak through them.

**The admin console is a convenience, not a security boundary.** Every query it
makes is independently subject to RLS. A bug in the guard could render a page;
it could not expose or alter a row.

---

## Deferred, and how to land it

| Feature                           | Where it plugs in                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cart / checkout (P6)**          | Route shells exist at `(site)/cart` and `(site)/checkout` with the guard already in place. `POST /cart/add` returns 501 past the gate. Add `carts`, `cart_items`, `orders`, `order_items` — named in §5 but not created. |
| **Payment**                       | Behind its own interface, like `ImageStore`. Do not wire a provider without asking.                                                                                                                                      |
| **Search overlay**                | `Header` takes an optional `onsearch` prop and renders the control only when it is supplied.                                                                                                                             |
| **Homepage copy in the database** | Sections take content as props. Add a `home_sections` table and change one `load`; no component changes.                                                                                                                 |
| **Wishlist**                      | Already in `COMMERCE_ROUTES`, so it is gated before it exists.                                                                                                                                                           |

---

## Deviations from the brief

| Brief                             | Built                   | Why                                                                                                                                                                                     |
| --------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm                              | npm                     | Project owner's call; the repo already had `package-lock.json`.                                                                                                                         |
| `adapter-vercel`                  | `adapter-auto`          | Project owner's call. `adapter-auto` delegates to `adapter-vercel` on Vercel; the cost is that Vercel-specific options (runtime, regions, ISR) cannot be set until it is swapped in.    |
| `--color-accent` for eyebrow text | `--color-accent-strong` | `#C08A3E` measures **2.71:1** on cream — it fails AA at every size. Accent is kept for fills, rules and CTA backgrounds (ink on amber is 5.59:1). See the contrast table below.         |
| Sticky header                     | Fixed header            | A sticky header sits _in_ flow, so "transparent over the hero" would show page background behind it, not the hero image. `--header-h` offsets `main`.                                   |
| Decorative PNG accents            | Inline SVG              | Line drawings: a fraction of the weight, sharp at any density, inherits theme colour, no extra request.                                                                                 |
| Homepage copy from the database   | Typed content module    | §8 permits "database or a typed content module"; §10 only forbids copy hardcoded _in a component_. Products, prices and categories — the parts with editorial weight — are in Postgres. |
| Row types from the CLI            | Generated ✅            | Was hand-written during P2 because no project existed yet. Now generated.                                                                                                               |

### Contrast (WCAG AA)

| Pairing                         | Ratio   |              |
| ------------------------------- | ------- | ------------ |
| `ink` on `cream`                | 15.14:1 | ✅           |
| `muted` on `cream`              | 5.48:1  | ✅           |
| `muted` on `sand`               | 4.77:1  | ✅           |
| `accent-strong` on `cream`      | 5.41:1  | ✅           |
| `accent-strong` on `sand`       | 4.72:1  | ✅           |
| `accent-soft` on `olive`        | 4.94:1  | ✅           |
| `ink` on `accent` (CTA)         | 5.59:1  | ✅           |
| `cream` on `olive`              | 9.98:1  | ✅           |
| `cream` on the catering banner  | 5.60:1  | ✅           |
| ~~`accent` as text on `cream`~~ | 2.71:1  | ❌ never use |

The catering row is the only one measured against a photograph rather than a
flat colour: the overlay in `CateringCta.svelte` sits over `banner1.png`, so the
ratio was sampled from the lightest rendered pixel behind the heading (desktop
1440×900; mobile measures 5.77:1). Re-measure it if either the overlay or that
photograph changes — the gradient is tuned to that image, not to a token.

Surfaces switch between the text-safe variants through one inherited custom
property, `--accent-text`, which `.on-dark` re-points. Components never need to
know which background they landed on.

---

## Environment

`.env` is gitignored and holds no committed values.

| Variable                    | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`       | Project URL.                                                              |
| `PUBLIC_SUPABASE_ANON_KEY`  | Anon key. Safe in the browser — RLS is what protects the data.            |
| `SUPABASE_SERVICE_ROLE_KEY` | **Bypasses RLS.** Server only. Newsletter writes, storage, admin scripts. |
| `PUBLIC_SITE_URL`           | Absolute origin for canonical URLs, sitemap and JSON-LD.                  |
| `IMAGE_STORE`               | `local` \| `supabase`.                                                    |

Read through `$env/dynamic/*`, not `$env/static/*`, so a missing variable fails
at the point of use with an actionable message rather than failing the build.

---

## Granting admin access

There is deliberately no sign-up. Create the account in the Supabase dashboard
(Authentication → Users → Add user), then:

```sql
insert into public.admin_users (user_id, note)
select id, 'first admin' from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;
```

Removing the row revokes access on the next request — there is no token to wait
out.
