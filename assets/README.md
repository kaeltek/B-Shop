# assets/

Original photography, kept out of `static/` on purpose.

Anything under `static/` is copied verbatim into the build and deployed. These
originals are ~23MB and nothing references them at runtime, so they live here
instead: versioned, available for re-encoding, and absent from production.

| Directory      | Sources | Encoded to                          | By                            |
| -------------- | ------- | ----------------------------------- | ----------------------------- |
| `gallery/`     | 19      | `static/gallery/*.webp` (2.1MB)     | `scripts/encode-gallery.mjs`  |
| `hero-images/` | 2       | `static/hero-images/*.webp` (376KB) | hand-run sharp, same settings |

To add or replace a gallery photograph: drop the file in `assets/gallery/` with
a descriptive kebab-case name, run `node scripts/encode-gallery.mjs`, and paste
the printed manifest entry into `src/lib/content/gallery.ts` — writing the `alt`
text by hand, since that is the one field the script cannot generate.
