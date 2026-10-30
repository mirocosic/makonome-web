# Makonome manual: plan

Status: plan, waiting for approval (23 Oct 2026).

Turn makonome.com/manual from one short text page into a real manual: one page per area, screenshots everywhere, the same text for every platform with a switch for what differs (iOS · Mac · Android), and stable anchors the app can link to. Research behind it (session scratchpad): `manual-inventory.md` (every feature from the code, with UI paths, Free/Pro and platform differences), `manual-android.md` (from the Android session), and the website survey.

## What we know

- **Website** (makonome-web): Astro 5, static, dark theme only, no MDX, no search, no PR previews (review is local with `npm run preview`). Today's manual is one page with anchors `#basics`, `#time-signatures`, `#beat-accents`, `#gap-trainer`, `#tempo-changer`, `#sounds`, `#practice`. Screenshots on the home page are full device resolution with no resizing.
- **App** (1.1.0): about 100 documentable items. The manual today covers maybe a fifth, and has wrong facts (BPM starts at 20 now, practice sessions are manual and Pro, pitch and 4 of 5 sounds are Pro). Five features sit behind **Settings → Experimental Features**, off by default (haptics, tempo detection, Accuracy Trainer, visualizations, Link); the manual never says so.
- **Android**: not public yet (v3 in closed test). It lacks count-in, auto stop, screen flash, the collection player, the Accuracy Trainer, Link and the manual link; BPM is 40–400 with no typing; one home widget; a different Pro model.
- **Screenshot tool** (`tools/screenshots.sh` + `ScreenshotMode`): 14 scenes, dark, Pro on, demo presets and history, iPhone 17 Pro Max / iPad Pro 13 / Mac. Many manual scenes are missing (list below). Widgets can't show demo data yet (they read the real app group).

## Decisions (my recommendation first)

| # | Question | Recommendation | Alternative |
|---|---|---|---|
| M1 | How to handle three platforms | **One URL per topic** (`/manual/time-signatures`) with a **platform switch** at the top that shows that platform's screenshots and notes. Choice from `?platform=`, then remembered, then guessed from the browser. Without JavaScript it shows iOS with short "On Mac / On Android" notes. One text to maintain, one link per topic | Separate pages per platform (`/manual/mac/...`): no script needed, but three copies to keep in step |
| M2 | Writing format | **MDX** (the official Astro add-on): pages are Markdown with a few components (`<Platform>`, `<Screenshot>`, `<Pro>`, `<Experimental>`). Easy to write and review | Plain `.astro` pages: no new dependency, much more markup per page |
| M3 | Search | **Later** (Pagefind, a static search, once the content is there) | Now |
| M4 | Screenshot theme | **Dark only**, matching the site and the existing screenshots | Light and dark (needs app code for a light screenshot mode, double the images) |
| M5 | Android | **"Coming soon" tab**: a short page of what Android has today, no screenshots, no promises until it's public | Hide Android until release |
| M6 | When it goes live | **When 1.1 is in the App Store**, so the manual never describes features users don't have | As soon as it's written |
| M7 | Experimental features | **Document them**, with a clear "turn it on in Settings → Experimental Features" box | Leave them out |
| M8 | Old links | `/manual#basics` etc. keep working: `/manual` becomes the start page and maps old anchors to the new pages | Let them break |

## Structure

| Page | Covers |
|---|---|
| Getting started | Install, trial and Pro (what's free), the three tabs, the first metronome in 30 seconds, where Experimental Features are |
| The metronome screen | BPM dial, ± buttons, typing a BPM, tap tempo, tempo names, play/stop, beat rings and their three states, the bar/beat readout |
| Time signatures | Common meters, custom meters, accent groups (7/8 as 2+2+3 …), compound meters and the dotted pulse, subdivisions |
| Sound and feel | Sounds, volume, pitch, voice count, haptics, screen flash, visualizations |
| Count-in and auto stop | Bars and sounds, stopping after bars or time, the bar counter, how both behave with trainers and Link |
| Trainers | Gap Trainer (incl. progressive), Tempo Changer (bars or time, target) |
| Presets and collections | Saving, editing, notes, favorites, duplicating, collections, reordering, **playing a collection** (bar, keys, Bluetooth foot pedals), presets from a newer version |
| Practice tracking | Sessions and goals, history, streaks, reminders, **widgets** (home + lock screen, "open the app once") |
| Accuracy Trainer | MIDI setup (EAD10 as the example), live view, tightness, per-drum view, practice mode, Free Time, recordings and sharing, the Mac window |
| Tempo detection | Microphone, the two engines, applying the result (searches from 40 BPM) |
| Ableton Link | Turning it on, start/stop sync, latency offset, odd meters, what count-in and auto stop do with peers |
| Mac | Window, menu bar commands, keyboard shortcuts, the trainer window, foot pedals |
| Settings, backup and data | Every Settings section, iCloud backup and restore, reset all data, the User Manual link |
| Troubleshooting and FAQ | No sound (silent switch), widget shows 0, Link finds no peers (local network permission), MIDI device not found, "Made with a newer version" presets, restoring on a new phone |

Each page: a short intro, then tasks ("To play a collection: …") with a screenshot each, then a reference list of options and ranges. Badges for **Pro** and **Experimental**. Every heading gets a stable id, so the app can deep-link later (#77).

## Screenshots

- **New scenes** in `ScreenshotMode` / `tools/screenshots.sh` (app repo PR):
  - **Metronome:** idle, beat states, BPM typing, the ••• menu, Sound Settings, Gap Trainer and Tempo Changer sheets and running states, Playback Options (count-in, auto stop) and the count-in and auto-stop readouts.
  - **Visualizations:** Pendulum, Count and Line.
  - **Presets and collections:** new preset form, collections tab, collection detail, the **collection player bar** (needs demo collections), reorder mode.
  - **Practice:** setup, active session, history.
  - **Accuracy Trainer:** no device, Free Time idle, recording, session detail.
  - **Other screens:** Settings (2–3), paywall, tempo detection, Link sheet.
  - **Widgets:** all five families. Needs a DEBUG scene that renders the widget views with demo data.
  - **Mac:** menu bar menu, player bar in the main window.
- **Captured** on iPhone 17 Pro Max, iPad Pro 13 and Mac. Mac capture works from this session since the permissions were granted. Menus and notifications need a hand-placed shot.
- **Into the site:** a small sync step copies `docs/screenshots/manual/<platform>/` into makonome-web `src/assets/manual/`, and the pages use Astro's built-in image handling (resized, WebP, lazy-loaded), so dozens of shots stay light. They open in the existing lightbox.
- **Redo every release** with one command, so screenshots never go stale.

## Order of work

1. **Site plumbing** (makonome-web PR): MDX, manual layout with a sidebar, the four components, platform switch, old-anchor mapping, image handling. About 1–2 days.
2. **Screenshot scenes** (app PR): the scene list above, demo collections, the widget scene. About 2–3 days.
3. **Content**, written from the inventory and checked against the code, in two or three batches you review in the local preview (I can open it in the browser pane). About 3–5 days.
4. **Android "coming soon"** page from the Android notes.
5. **App link** passes the platform (`?platform=ios` / `mac`) in a 1.1.x build. Per-sheet "?" links come later with #77.
6. **Publish** with the 1.1 release (M6).

## Related app issues found on the way

- Quick action "Start Practice" skips the Pro check.
- The paywall lists Visualizations and Full History as Pro, but neither is gated.
- makonome-hq docs/FEATURES.md promises three haptic intensities, but no screen sets one.
- Android: backup rules name `makonome_database`, but the file is `makonome.db`, so presets and history aren't backed up (the Android session owns this).

The manual documents what the code does. Where these are fixed first, it follows the fix.
