// Image guard for the built site. Run after `npm run build`: `npm run check:images`.
//
// Why this exists next to Lighthouse CI: Lighthouse does not load lazy images below the
// fold, so a heavy screenshot further down a manual page never shows up in its score.
// This check reads every image in dist/ instead, so it catches those too.
//
// Fails (exit 1) when:
// 1. an image file the site serves is over MAX_BYTES,
// 2. an image file in dist/assets/ is not linked from any HTML/CSS/JS file (Astro shipped a
//    file nobody loads, usually a full-size original next to its WebP copies), or
// 3. a built page links a PNG/JPG/JPEG outside /assets/ from any attribute (src, srcset,
//    data-lightbox-src, href, style url(...)) or an inline <style>, i.e. a raw file from
//    public/ that skipped the astro:assets pipeline (no WebP, no resizing).

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

// Optional first argument: another build folder (used to test this script on a copy).
const DIST = process.argv[2] ?? 'dist';
// Astro's build output folder for processed images (`build.assets` in astro.config.mjs).
const ASSETS_DIR = 'assets';
// Largest image today is ~64 KB (a Mac settings shot, lightbox copy). 150 KB leaves room.
const MAX_BYTES = 150 * 1024;
const IMAGE_EXT = /\.(webp|avif|png|jpe?g|gif)$/i;
const RAW_IMG_EXT = /\.(png|jpe?g)$/i;
// PNG/JPG URLs inside an attribute value or CSS: plain src, each srcset candidate, url(...).
const RAW_IMG_URL = /[^\s,'"()]+\.(?:png|jpe?g)(?:[?#][^\s,'"()]*)?(?=[\s,'"()]|$)/gi;
// Rule 3's exceptions: the link preview image in <meta content> (og:image, twitter:image),
// and the PNG favicon and Apple touch icon in <link href>.
const RAW_IMG_ALLOWED = (attr, path) =>
  (attr === 'content' && path === '/og-image.png') ||
  (attr === 'href' && (path === '/favicon-32.png' || path === '/apple-touch-icon.png'));

// Files in dist/ (paths relative to dist/) that pages don't render as content.
const ALLOWLIST = new Set([
  // Link preview image for social sites (og:image), never shown on the page.
  'og-image.png',
  // Old home page screenshot, not used by any page. Remove it from public/ when convenient.
  'screenshots/screen-1.png',
  // Files in dist/assets/ that rule 2 should not flag go here, with the reason. None today.
]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

const toPosix = (p) => p.split(sep).join('/');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const files = (await walk(DIST)).map((p) => toPosix(relative(DIST, p)));
const textFiles = files.filter((f) => /\.(html|css|js)$/.test(f));
const texts = await Promise.all(textFiles.map(async (f) => [f, await readFile(join(DIST, f), 'utf8')]));
const allText = texts.map(([, t]) => t).join('\n');

const errors = [];

// 1. Byte limit, and 2. unlinked files in dist/assets/.
let largest = { file: '', size: 0 };
for (const file of files.filter((f) => IMAGE_EXT.test(f))) {
  if (ALLOWLIST.has(file)) continue;
  if (file.startsWith(`${ASSETS_DIR}/`) && !allText.includes(`/${file}`)) {
    errors.push(
      `dist/${file} is not linked from any page, stylesheet or script, but it is deployed. ` +
        `Usually Astro kept a full-size original: code read .src/.width/.height of an imported ` +
        `image (use imageSize() from src/lib/images.ts, and pass the image only to <Image> or ` +
        `getImage()), or a glob imports a src/assets/ file no page renders. If it must ship, ` +
        `add it to ALLOWLIST in scripts/check-images.mjs with the reason.`
    );
    continue;
  }
  const { size } = await stat(join(DIST, file));
  if (size > largest.size) largest = { file, size };
  if (size > MAX_BYTES) {
    errors.push(`dist/${file} is ${kb(size)}, over the ${kb(MAX_BYTES)} limit.`);
  }
}

// 3. Raw PNG/JPG linked from any attribute or inline <style>. Matches attribute values
// directly, not whole tags, so a `>` inside another attribute can't hide a URL.
for (const [file, html] of texts.filter(([f]) => f.endsWith('.html'))) {
  const values = [];
  for (const m of html.matchAll(/\s([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    values.push([m[1].toLowerCase(), m[2] ?? m[3]]);
  }
  for (const m of html.matchAll(/<style\b[^]*?<\/style>/gi)) values.push(['<style>', m[0]]);
  for (const [attr, value] of values) {
    for (const [url] of value.matchAll(RAW_IMG_URL)) {
      const path = new URL(url, 'https://makonome.com/').pathname;
      if (!RAW_IMG_EXT.test(path)) continue;
      if (path.startsWith(`/${ASSETS_DIR}/`)) continue;
      if (RAW_IMG_ALLOWED(attr, path)) continue;
      errors.push(
        `dist/${file} links ${url} (in ${attr}): a raw PNG/JPG from public/. ` +
          `Import it from src/assets/ and use <Image> (or <Screenshot> in the manual) so it is resized to WebP.`
      );
    }
  }
}

if (errors.length) {
  console.error(`Image check failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}

console.log(
  `Image check passed. Largest served image: dist/${largest.file} (${kb(largest.size)}), ` +
    `limit ${kb(MAX_BYTES)}. No unlinked images in dist/${ASSETS_DIR}/.`
);
