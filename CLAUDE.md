# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal "influences DNA" page (https://dna.darthvid.com/), a SvelteKit 3 (Svelte 5 runes) + Vite + `@sveltejs/adapter-static` site built as a webdev learning exercise (earlier iterations were Vue/React; see README). Code is intentionally experimental/messy. Tests use Vitest (`npm test`); linting is Prettier + ESLint, type checking is svelte-check with JSDoc. The last Rollup-based version is tagged `pre-sveltekit-migration`.

## Commands

- `npm install`
- `npm run dev` — Vite dev server
- `npm run build` — prerenders the site into `build/` (every route is prerendered; `src/routes/+layout.js` sets `prerender = true`)
- `npm run preview` — serve `build/`
- `npm test` — Vitest (jsdom), `src/**/*.test.js`. `vitest.setup.js` stubs `HTMLDialogElement.showModal`/`close`, which jsdom lacks. In tests, wrap `querySelector` results in `must()` from `src/lib/test-utils.js` (throws if missing, narrows the type for svelte-check).
- `npm run test:e2e` — Playwright smoke tests in `tests/` (Chromium). Its `webServer` runs `npm run build && npm run preview` first. They cover what jsdom can't: the prerendered page and the real `<dialog>` (Esc/click to close). Run `npx playwright install chromium` once per machine.
- `npm run lint` — Prettier `--check` + ESLint (flat config, `eslint.config.js`); `npm run format` writes Prettier fixes
- `npm run check` — `svelte-kit sync` + `svelte-check` against `jsconfig.json` (`checkJs`, `strict`; no TypeScript, types are JSDoc). Global types go in `src/app.d.ts`; the Vite `define` constants are also declared as ESLint globals.
- `npm version <x>` — runs `auto-changelog` and stages `CHANGELOG.md` (don't edit the changelog by hand)

**Build-time env:** `PUBLIC_GITHUB_SHA` and `PUBLIC_GA_TRACKING_ID` are declared with `defineEnvVars` in `src/env.js` (SvelteKit 3 API) and imported from `$app/env/public`. Both are optional: the SHA defaults to `dev`, and an empty GA ID skips analytics. CI sets them from `github.sha` and the `GA_TRACKING_ID` secret. Note the user's shell profile exports placeholder values for these (e.g. `PUBLIC_GA_TRACKING_ID=PUBLIC_GA_TRACKING_ID`); use `env -u` to test the unset case.

The package and Svelte versions shown on the page are `__PKG_VERSION__` / `__SVELTE_VERSION__`, Vite `define` constants set in `vite.config.js` (Svelte's is read from the installed `svelte/package.json`). Their types are in `src/app.d.ts`.

## Architecture

- **Imports:** SvelteKit 3 removed `$lib`; use `#lib/*` (Node subpath import declared in `package.json` `imports`).
- **Shell:** `src/app.html` holds the CSP `<meta>`, title, favicon and Google Fonts link. `src/routes/+layout.svelte` imports `styles.css` (global styles) and renders `#lib/analytics/Analytics.svelte` (gtag, only when the GA ID is set).
- **Page:** `src/routes/+page.svelte` (header, version/commit links, footer) → `#lib/views/Deck.svelte` → `#lib/components/Card.svelte` / `#lib/components/Modal.svelte`.
- **Data flow:** card content lives in `src/lib/data/deck.json`, imported directly by `Deck.svelte` and rendered in a keyed `{#each}` (key: `title`, which the data test enforces as unique). `Deck` holds the opened card as local `$state`; there are no stores.
- **Card:** 3D parallax hover effect; double-click calls the `onopen(params)` callback prop. `Card.svelte` is meant to be identical to the one in the sibling project `tehdarthvid/tehdarthvid.github.io` (`claude-experiments` branch), whose Deck would pass `onopen` to do its `window.open`.
- **Modal:** a native `<dialog>` opened with `showModal()`. Esc closes it natively; any click calls `close()`. Both paths fire the `close` event, which calls `onclose`.
- **Card JSON fields** (as used by `Card.svelte`): `title`, `date`, `imgURL`, `vidURL`, `ytVideoID`. Precedence for the background media is `ytVideoID` > `vidURL` > `imgURL`.
- **Svelte 5 conventions:** runes (`$props`, `$state`, `$derived`, `$effect`), DOM-attribute events (`onclick`), callback props instead of `createEventDispatcher`.

## Style

Prettier (same config as the sibling): tabs, single quotes, no trailing commas, printWidth 100, `prettier-plugin-svelte`. `.prettierignore` skips `CHANGELOG.md` (auto-generated). `deck.json` is Prettier-formatted too. `.npmrc` sets `engine-strict=true`.

## Deployment

Security response headers (HSTS, nosniff, Referrer-Policy, etc.) are set in `firebase.json` `hosting.headers`; only the CSP stays as a `<meta>` in `src/app.html` (so it also applies in local dev). Meta `http-equiv` versions of the other headers are ignored by browsers.

GitHub Actions (`.github/workflows/fb-deploy.yml`) runs on pushes to `master` and `claude-experiments` (ignoring README/CHANGELOG/.gitignore/.gitattributes changes): `npm ci` → lint → check → Vitest → Playwright (Chromium, no `--with-deps`) → build → deploy with `FirebaseExtended/action-hosting-deploy`.

- `master` deploys to the live site, with GA.
- **check-ga job** (`master` only, after deploy): fetches the live page (retrying until it shows the deployed commit, up to ~10 min) and looks for the gtag script with the secret's ID. If it's missing, it emits a warning and opens (or comments on) one `GA missing on live site` issue; when GA is back it closes that issue. It never fails the run for missing GA. Permissions: `issues: write` only, via `GITHUB_TOKEN`.
- `claude-experiments` deploys to the `claude-experiments` preview channel, which expires 7 days after the last push. The URL is in the run's summary. Previews are built without the GA ID so they don't count as traffic, and the Playwright build never has it.
- Node 24 (not 26: `firebase-tools` only supports Node 20-24, and `.npmrc` `engine-strict` makes that fatal), `ubuntu-24.04`, 15-minute timeout. Concurrent preview runs cancel each other; live runs are never cancelled.
- To deploy, use the `deploy` skill (`.claude/skills/deploy/SKILL.md`): local checks, push `claude-experiments` (preview), confirm, fast-forward `master`, watch the run, check the live site.
- Repo secrets: `GA_TRACKING_ID`, `FIREBASE_SERVICE_ACCOUNT`. Repo variable: `FIREBASE_PROJECT_ID` (a variable so the preview URL isn't masked; the ID is public anyway).

## Known issues

- Some card images don't load in local dev. Likely cause: the image server only serves requests from the production domain. Not a code bug; revisit only if it becomes a real problem.
