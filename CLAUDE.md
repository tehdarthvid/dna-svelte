# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal "influences DNA" page (https://dna.darthvid.com/), a SvelteKit 3 (Svelte 5 runes) + Vite + `@sveltejs/adapter-static` site built as a webdev learning exercise (earlier iterations were Vue/React; see README). Code is intentionally experimental/messy. Tests use Vitest (`npm test`); linting is Prettier + ESLint, type checking is svelte-check with JSDoc. The last Rollup-based version is tagged `pre-sveltekit-migration`.

## Site purpose & design philosophy

- A visualization of the media and things that shaped the owner. Content is stable: an occasional card added or removed.
- Its main role is a testbed for tech stacks, automation, security and maintenance. Expect major changes to be stack swaps or presentation redesigns, not content work. Experiments are welcome here.
- Favor low-maintenance automation, and keep card data (`deck.json`) and images (S3) portable between stacks.
- `Card.svelte` is shared with `tehdarthvid.github.io` (darthvid.com), whose copy is the reference. That site aims for simple code and fast loads, so complexity added to `Card.svelte` for a dna experiment must not leak into it without flagging it.

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
- **Shell:** `src/app.html` holds the CSP `<meta>`, title and favicon. `src/routes/+layout.svelte` imports `styles.css` (global styles) and the fonts, and renders `#lib/analytics/Analytics.svelte` (gtag, only when the GA ID is set).
- **Fonts** are self-hosted from Fontsource packages (`@fontsource/ubuntu`, `@fontsource/noto-sans-jp`, weight 400): the Latin Ubuntu face is preloaded, and Noto Sans JP's CSS (~120 unicode-range subsets) is imported after hydration so it doesn't block render. `vite.config.js` keeps `.woff`/`.woff2` out of asset inlining, because the CSP has no `data:` font source. Don't add Google Fonts links back; a Playwright test checks that fonts come only from the site's own host.
- **Page:** `src/routes/+page.svelte` (header, version/commit links, footer) → `#lib/views/Deck.svelte` → `#lib/components/Card.svelte` / `#lib/components/Modal.svelte`.
- **Data flow:** card content lives in `src/lib/data/deck.json`, imported directly by `Deck.svelte` and rendered in a keyed `{#each}` (key: `title`, which the data test enforces as unique). `Deck` holds the opened card as local `$state`; there are no stores.
- **Card:** 3D parallax hover effect; double-click calls the `onopen(params)` callback prop. `Card.svelte` must stay byte-identical to the one in the sibling project `tehdarthvid/tehdarthvid.github.io` (`claude-experiments` branch), which is the reference copy: change it there first, then copy it here. Site-specific behavior goes in each site's `Deck.svelte` (the sibling's Deck passes `onopen` to do its `window.open`). YouTube cards show the video's still frame (`i.ytimg.com`) first; the muted player (`www.youtube-nocookie.com`) is added after the page's `load` event once the card is near the viewport, stays hidden until its iframe loads, and is skipped under data saver or `prefers-reduced-motion`. No dna card uses YouTube today, so the CSP `img-src` doesn't list `i.ytimg.com`: add it if one is ever added.
- **Modal:** a native `<dialog>` opened with `showModal()`. Esc closes it natively; any click calls `close()`. Both paths fire the `close` event, which calls `onclose`.
- **Card JSON fields** (as used by `Card.svelte`): `title`, `date`, `imgURL`, `vidURL`, `ytVideoID`. Precedence for the background media is `ytVideoID` > `vidURL` > `imgURL`.
- **Full-size images:** every `imgURL` is self-hosted in the same S3 bucket under `ditim/full/` (bucket-subdomain URL, spaces as `%20`), keeping the image's original format with a matching extension and `Content-Type`, and `Cache-Control: public, max-age=31536000, immutable`. Don't point cards at outside image hosts.
- **Thumbnails:** each `deck.json` entry also has `thumbURL`, a 480×640 WebP copy in the same S3 bucket under `ditim/thumbs/` (same Referer restriction as the originals). `Deck.svelte` passes it to `Card` as `imgURL`; the modal still opens the full-size `imgURL`. For a new card, make a thumbnail too (sharp: `resize(480, 640, { fit: 'cover' })`, WebP quality 68) and upload it with `Content-Type: image/webp` and `Cache-Control: public, max-age=31536000, immutable`.
- **Svelte 5 conventions:** runes (`$props`, `$state`, `$derived`, `$effect`), DOM-attribute events (`onclick`), callback props instead of `createEventDispatcher`.

## Style

Prettier (same config as the sibling): tabs, single quotes, no trailing commas, printWidth 100, `prettier-plugin-svelte`. `.prettierignore` skips `CHANGELOG.md` (auto-generated). `deck.json` is Prettier-formatted too. `.npmrc` sets `engine-strict=true`.

## Deployment

Security response headers (HSTS, nosniff, Referrer-Policy, etc.) are set in `firebase.json` `hosting.headers`; only the CSP stays as a `<meta>` in `src/app.html` (so it also applies in local dev). Meta `http-equiv` versions of the other headers are ignored by browsers. Caching is set there too: `no-cache` (revalidate) for everything, overridden by `public, max-age=31536000, immutable` for the content-hashed `/_app/immutable/**` files (the later rule wins). Keep dev-only hosts (`localhost`, `ws:`) out of the CSP: `'self'` already covers Vite's dev server and HMR socket.

GitHub Actions (`.github/workflows/fb-deploy.yml`) runs on pushes to `master` and `claude-experiments` (ignoring README/CHANGELOG/.gitignore/.gitattributes changes): `npm ci` → lint → check → Vitest → Playwright (Chromium, no `--with-deps`) → build → deploy with `FirebaseExtended/action-hosting-deploy`.

- `master` deploys to the live site, with GA.
- **check-ga job** (`master` only, after deploy): fetches the live page (retrying until it shows the deployed commit, up to ~10 min) and looks for the gtag script with the secret's ID. If it's missing, it emits a warning and opens (or comments on) one `GA missing on live site` issue; when GA is back it closes that issue. It never fails the run for missing GA. Permissions: `issues: write` only, via `GITHUB_TOKEN`. A second step then fetches every `imgURL` and `thumbURL` in `deck.json` with `Referer: https://dna.darthvid.com/` and expects a 200 with an `image/*` Content-Type; failures go to one `Card images failing on live site` issue the same way (warn, open/comment, auto-close). This is the only test that actually loads the S3 images (Vitest checks URL format only; e2e runs on localhost, which the bucket's Referer rule blocks).
- `claude-experiments` deploys to the `claude-experiments` preview channel, which expires 7 days after the last push. The URL is in the run's summary. Previews are built without the GA ID so they don't count as traffic, and the Playwright build never has it.
- Actions are pinned to full commit SHAs (version in a trailing comment); `.github/dependabot.yml` proposes updates as PRs against `claude-experiments` (it only runs once that file is on `master`). The action's `firebaseToolsVersion` input is pinned too (it defaults to `latest`); Dependabot can't update it, so bump it by hand.
- Node 24 (not 26: `firebase-tools` only supports Node 20-24, and `.npmrc` `engine-strict` makes that fatal), `ubuntu-24.04`, 15-minute timeout. Concurrent preview runs cancel each other; live runs are never cancelled.
- To deploy, use the `deploy` skill (`.claude/skills/deploy/SKILL.md`): local checks, push `claude-experiments` (preview), confirm, merge into `master` without the Claude-only files, watch the run, check the live site.
- Claude-only files (`CLAUDE.md` anywhere, `.claude/`) live only on `claude-experiments` and never go to `master`: a deploy merges `claude-experiments` into `master` with those paths removed. So `master` is never a fast-forward and is never merged back into `claude-experiments`. The workflow ignores pushes that only change these paths.
- Repo secrets: `GA_TRACKING_ID`, `FIREBASE_SERVICE_ACCOUNT`. Repo variable: `FIREBASE_PROJECT_ID` (a variable so the preview URL isn't masked; the ID is public anyway).

## Known issues

- Some card images don't load in local dev. Likely cause: the image server only serves requests from the production domain. Not a code bug; revisit only if it becomes a real problem.
