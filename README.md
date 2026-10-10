# makonome-web

Website for Makonome (https://makonome.com). Astro 5, deployed to GitHub Pages.

## Where content comes from

- **Changelog:** built from `docs/release-notes/*.md` in the app repo
  [mirocosic/makonome](https://github.com/mirocosic/makonome). The build reads them through an Astro
  content collection (`src/content.config.ts`). Never edit the changelog here.
- **Features and screenshots:** still maintained by hand in this repo. The source for screenshots is
  `docs/screenshots/vX.Y.Z/` in the app repo.

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
