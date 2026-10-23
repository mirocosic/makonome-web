import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Release notes live in the app repo (mirocosic/makonome), docs/release-notes/.
// CI checks that repo out into ./app. Locally: APP_REPO_PATH=../makonome npm run dev
const appRepo = process.env.APP_REPO_PATH || './app';
const releaseNotesDir = resolve(appRepo, 'docs/release-notes');

if (!existsSync(releaseNotesDir)) {
  throw new Error(
    `Release notes folder not found: ${releaseNotesDir}\n` +
      `Set APP_REPO_PATH to a checkout of mirocosic/makonome (default ./app). See README, "Local development".`
  );
}

const releaseNotes = defineCollection({
  loader: glob({
    pattern: ['*.md', '!README.md'],
    base: releaseNotesDir,
  }),
  schema: z.object({
    version: z.coerce.string(),
    date: z.coerce.date(),
    note: z.string().optional(),
  }),
});

// The user manual, one MDX file per topic. See README, "Manual".
const manual = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/manual' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Reading order across the whole manual. Groups appear in the order of their first page.
    order: z.number(),
    // Sidebar group heading.
    group: z.string(),
    // Platforms the page applies to. Others see a "not on this platform" banner. Android is opt-in per page until its content is written.
    platforms: z.array(z.enum(['ios', 'mac', 'android'])).nonempty().default(['ios', 'mac']),
  }),
});

export const collections = { releaseNotes, manual };
