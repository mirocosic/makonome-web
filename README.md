# makonome-web

Website for Makonome (https://makonome.com). Astro 5, deployed to GitHub Pages.

## Where content comes from

- **Changelog:** built from `docs/release-notes/*.md` in the app repo
  [mirocosic/makonome](https://github.com/mirocosic/makonome). The build reads them through an Astro
  content collection (`src/content.config.ts`). Never edit the changelog here.
- **Features and screenshots:** still maintained by hand in this repo. The source for screenshots is
  `docs/screenshots/vX.Y.Z/` in the app repo. The home page's shots live in `src/assets/screenshots/`
  and are imported in `src/pages/index.astro`, so the build resizes them to WebP.

## Deploys

`.github/workflows/deploy.yml` runs on push to `main`, on manual dispatch, and on pull requests
(build only, no deploy). The app repo triggers it with `workflow_dispatch` (its `website.yml`) on
`v*` tags and on release-note changes.

The build checks out the app repo with the secret `MAKONOME_READ_TOKEN`: a fine-grained PAT with
Contents read-only on `mirocosic/makonome`. It expires. If the build fails with "MAKONOME_READ_TOKEN
missing or expired", create a new token and update the secret in this repo's Actions settings.

## Local development

The changelog needs a checkout of the app repo. Point `APP_REPO_PATH` at it:

```bash
npm ci
APP_REPO_PATH=../makonome npm run dev
```

Without `APP_REPO_PATH` the build looks in `./app` (gitignored), so a symlink works too:
`ln -s ../makonome app`. If the folder is missing, the build fails with an error on purpose.

```bash
APP_REPO_PATH=../makonome npm run build
```

## Performance checks

Two checks in the build job keep new screenshots from slowing the site down:

- **Image check** (`scripts/check-images.mjs`), on every run, including deploys from `main`. Fails
  when a served image in `dist/` is over 150 KB, or when a page links a PNG/JPG from
  `public/` in any attribute or inline `<style>` (it skipped the WebP pipeline; only `og-image.png` in `<meta>` is allowed). Lighthouse does not load lazy images below the fold, so
  this is the check that sees every screenshot. The original PNGs Astro copies into `dist/assets/`
  are skipped because no page links them. A short allowlist in the script covers `og-image.png` and
  the unused `screenshots/screen-1.png`.
- **Lighthouse CI** (`lighthouserc.json`, `@lhci/cli` 0.15.1), on pull requests only, so a flaky
  score never blocks a deploy. Mobile, 3 runs per page, median: performance ≥ 0.95, CLS ≤ 0.05,
  LCP ≤ 2.5 s, and no findings for unsized images, modern image formats, responsive images or
  offscreen images. Pages: `/`, `/manual/`, and `/manual/accuracy-trainer/` and
  `/manual/practice-tracking/` with `?platform=ios`. Lighthouse runs with an Android user agent,
  so without the parameter the manual shows only the few Android shots.

Run both locally after a build (Lighthouse needs Chrome):

```bash
npm run check:images
npx @lhci/cli@0.15.1 autorun
```

## Manual

The user manual lives at `/manual/`: one MDX page per topic in `src/content/manual/<slug>.mdx`
(the file name is the URL slug). The plan and its decisions are in `docs/MANUAL_PLAN.md`.

Frontmatter: `title`, `description`, `order` (reading order across the whole manual; sidebar groups
appear in the order of their first page), `group` (sidebar heading), and optional `platforms`
(`[ios, mac, android]` by default). Readers on a platform the page doesn't list see a banner.

Components, usable in any manual page without an import:

- `<Platform only="ios mac">…</Platform>`: content for some platforms (`inline` for a phrase in a sentence).
- `<Screenshot name="metronome-main" alt="…" only="ios mac" caption="…" />`: loads
  `src/assets/manual/<platform>/<name>.png` for each platform in `only` (default `ios mac`), resized
  to WebP and lazy-loaded, and opens in the lightbox. A missing file for a listed platform fails the
  build with the path in the message. To show a shot on one platform only, list only that one.
- `<Pro />`: Pro badge. `<Experimental feature="Accuracy Trainer" />`: "turn it on in Settings →
  Experimental Features" box. `<ComingSoon platform="android" message="…" />`: shown only on that platform.

**Platform switch:** `PlatformInit.astro` runs inline in `<head>` before first paint and sets
`<html data-platform>` from `?platform=ios|mac|android`, then the remembered choice
(localStorage `makonome-manual-platform`), then a user-agent guess. CSS hides `[data-only]` blocks
for other platforms. Without JavaScript every block shows with an "On Mac" style label.

**Heading ids** come from Astro's default slugger (github-slugger): lowercase, spaces become `-`,
punctuation is dropped (`## Gap Trainer` → `#gap-trainer`). They are deterministic, so the app can
link to them; renaming a heading changes its id, so treat ids that the app links to as fixed.

**Old links:** `/manual#basics`, `#gap-trainer` … from the old one-page manual are redirected by a
small script on `/manual/` (list in `src/pages/manual/index.astro`), with a visible list as a fallback.
