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

export const collections = { releaseNotes };
