# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal "influences DNA" page (https://dna.darthvid.com/), a Svelte 5 (runes) + Rollup 4 single-page app built as a webdev learning exercise (earlier iterations were Vue/React; see README). Code is intentionally experimental/messy. There are no tests and no linter.

## Commands

- `npm install`
- `npm run dev` — rollup watch + livereload, then serves `public/` via sirv on the dev server
- `npm run build` — production bundle to `public/build/bundle.{js,css}` (terser-minified; CSS extracted by `rollup-plugin-css-only`)
- `npm start` — serve `public/` only (no build)
- `npm version <x>` — runs `auto-changelog` and stages `CHANGELOG.md` (don't edit the changelog by hand)

**Required env vars:** `rollup.config.js` throws at startup unless `GITHUB_SHA` and `GA_TRACKING_ID` are set, even for `dev`. Locally, e.g.:

```
GITHUB_SHA=$(git rev-parse HEAD) GA_TRACKING_ID=dev npm run dev
```

The build also runs `npm info svelte version` (needs network) to display the latest Svelte version in the footer.

## Architecture

- **Build-time config injection:** `rollup.config.js` uses `@rollup/plugin-replace` with explicit `process.env.<key>` entries, so `process.env.pkg_ver`, `svelte_ver`, `git_hash`, `gaID` in `src/` are compile-time constants. Don't replace the bare `process` identifier: it corrupts Svelte 5 internals (`#process()`) (note the lowercase names differ from the shell env vars above). Adding a new config value means adding a key to the `replace` `values` in rollup config, not just `.env`.
- **Data flow:** card content lives in `src/data/deck.json`, bundled via `@rollup/plugin-json`. `src/stores/deckStore.js` exposes `deck` as a Svelte `readable` that first sets 10 empty placeholder cards, then `stores/actions.js` `initDeck` replaces them with the imported JSON. `activeCard` (writable) holds the card selected for the modal.
- **Svelte 5 conventions:** components use runes (`$props`, `$state`, `$derived`, `$effect`) and DOM-attribute events (`onclick`, not `on:click`); child→parent communication is via callback props (e.g. `Modal`'s `onclose`) rather than `createEventDispatcher`. The app is mounted with `mount()` in `main.js`. `Card.svelte` is kept in sync with the one in the sibling project `tehdarthvid/tehdarthvid.github.io` (SvelteKit, `claude-experiments` branch); the main difference is that this one sets `activeCard` on double-click (opens the modal) instead of `window.open`.
- **Component tree:** `main.js` → `App.svelte` (header, version/commit links, GA init) → `views/Deck.svelte` (renders `$deck` as `Card`s; shows `Modal` when `activeCard` is set) → `components/Card.svelte` (3D parallax hover effect; double-click sets `activeCard`) / `components/Modal.svelte` (full-size image, calls `onclose` on click or Esc).
- **Card JSON fields** (as used by `Card.svelte`): `title`, `date`, `imgURL`, `vidURL`, `ytVideoID`. Precedence for the background media is `ytVideoID` > `vidURL` > `imgURL`.
- `utils/google-analytics.js` injects gtag when `gaID` is set; `utils/logger.js` just re-exports `console`.

## Deployment

GitHub Actions (`.github/workflows/fb-deploy.yml`) builds and deploys `public/` to Firebase Hosting on push to `master` (ignoring README/CHANGELOG/.gitignore/.gitattributes changes). It relies on repo secrets `GA_TRACKING_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT`.

## Known issues

- Some card images don't load in local dev. Likely cause: the image server only serves requests from the production domain. Not a code bug; revisit only if it becomes a real problem.
