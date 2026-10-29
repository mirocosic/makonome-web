// Image guard for the built site. Run after `npm run build`: `npm run check:images`.
//
// Why this exists next to Lighthouse CI: Lighthouse does not load lazy images below the
// fold, so a heavy screenshot further down a manual page never shows up in its score.
// This check reads every image in dist/ instead, so it catches those too.
//
// Fails (exit 1) when:
// 1. an image file the site serves is over MAX_BYTES, or
// 2. a built page has an <img> whose src is a PNG/JPG/JPEG outside /assets/, i.e. a raw
//    file from public/ that skipped the astro:assets pipeline (no WebP, no resizing).

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
// Astro's build output folder for processed images (`build.assets` in astro.config.mjs).
const ASSETS_DIR = 'assets';
// Largest image today is ~64 KB (a Mac settings shot, lightbox copy). 150 KB leaves room.
const MAX_BYTES = 150 * 1024;
const IMAGE_EXT = /\.(webp|avif|png|jpe?g|gif)$/i;
const RAW_IMG_EXT = /\.(png|jpe?g)$/i;

// Files in dist/ (paths relative to dist/) that pages don't render as content.
const ALLOWLIST = new Set([
  // Link preview image for social sites (og:image), never shown on the page.
  'og-image.png',
  // Old home page screenshot, not used by any page. Remove it from public/ when convenient.
  'screenshots/screen-1.png',
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

// 1. Byte limit.
// Astro also copies the original PNG of every imported screenshot into dist/assets/. No page
// links to those (pages use the WebP versions), so browsers never load them. Skip any file in
// dist/assets/ that no HTML/CSS/JS file mentions; once something links it, it is checked.
let largest = { file: '', size: 0 };
let skippedOriginals = 0;
for (const file of files.filter((f) => IMAGE_EXT.test(f))) {
  if (ALLOWLIST.has(file)) continue;
  if (file.startsWith(`${ASSETS_DIR}/`) && !allText.includes(`/${file}`)) {
    skippedOriginals++;
    continue;
  }
  const { size } = await stat(join(DIST, file));
  if (size > largest.size) largest = { file, size };
  if (size > MAX_BYTES) {
    errors.push(`dist/${file} is ${kb(size)}, over the ${kb(MAX_BYTES)} limit.`);
  }
}

// 2. Raw PNG/JPG <img> that bypasses astro:assets.
for (const [file, html] of texts.filter(([f]) => f.endsWith('.html'))) {
  for (const [, src] of html.matchAll(/<img\b[^>]*?\ssrc=["']([^"']+)["']/gi)) {
    const path = src.split(/[?#]/)[0];
    if (!RAW_IMG_EXT.test(path)) continue;
    if (path.startsWith(`/${ASSETS_DIR}/`)) continue;
    errors.push(
      `dist/${file} has <img src="${src}">: a raw PNG/JPG from public/. ` +
        `Import it from src/assets/ and use <Image> (or <Screenshot> in the manual) so it is resized to WebP.`
    );
  }
}

if (errors.length) {
  console.error(`Image check failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}

console.log(
  `Image check passed. Largest served image: dist/${largest.file} (${kb(largest.size)}), ` +
    `limit ${kb(MAX_BYTES)}. Skipped ${skippedOriginals} unlinked originals in dist/${ASSETS_DIR}/.`
);
