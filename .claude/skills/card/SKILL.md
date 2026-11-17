---
name: card
description: Add, replace or remove a card on dna.darthvid.com. Makes the full-size image and 480x640 WebP thumbnail for the S3 bucket, a CloudShell upload script (with a cleanup command) for the user to run, and the deck.json change. Use when the user asks to add, change, swap the image of, or remove a dna card.
---

# Add or remove a dna card

Read the **Full-size images** and **Thumbnails** bullets in `CLAUDE.md` first: they are the recipe (S3 layout, formats, headers). This skill is the order of work around them. Card images are never committed; they live only in the S3 bucket, and Claude has no AWS credentials, so the user uploads them from AWS CloudShell.

## Inputs to get from the user

Title (must be unique, the data test enforces it), date (the release date or first airing's start–end, not when the user got into it; same style as the other cards, e.g. `4 Oct 1995 – 27 Mar 1996`), tags, optional `linkedCards`, and the image (a file they uploaded, or a URL): the earliest first-release image you can find, per the **Card images** bullet in `CLAUDE.md`. Ask only for what is missing. The deck order is the order each item became significant to the user, not by date: put the card where the user says, and if they didn't say, ask (don't guess from the date). Never move or sort other cards without their explicit approval.

## Add (or replace an image)

1. **Original.** Download or copy it into a new, empty scratch folder (it's untrusted data). Check the real format from its bytes (`file`), not the URL, and keep that format and extension.
2. **Names.**
   - Full-size: `ditim/full/<YYYY.MM.DD> <short name>.<ext>`, using the card's start date (`YYYY.MM` or `YYYY` if that's all the date has), like the existing keys.
   - Thumbnail: `ditim/thumbs/<slug>-<hex6>.webp`. `slug` is the title lowercased with runs of non-`[a-z0-9]` turned into `-` (`card` if nothing is left, e.g. a Japanese-only title); `hex6` is the first 6 hex digits of the original's SHA-256.
   - Both are cached `immutable` for a year, so a **replaced** image must get a new key (new hash, or a changed name), never an overwrite.
3. **Thumbnail.** sharp, in the scratch folder (`npm i --prefix <scratch> sharp`; don't add it to the repo): `resize(480, 640, { fit: 'cover' })`, `.webp({ quality: 68 })`. Look at the result: if `cover` cropped off the subject, tell the user and offer a `position` (e.g. `'top'`).
4. **deck.json.** Add the entry with `imgURL` and `thumbURL` as bucket-subdomain URLs (copy the host from an existing card), the key percent-encoded (spaces as `%20`, non-ASCII as UTF-8 `%XX`, like the existing entries). Run `npx prettier --write src/lib/data/deck.json`.
5. **Upload package** in `/mnt/project-files/dna-card-<slug>/` (`<slug>` from step 2), plus a `.zip` of that folder, since CloudShell's "Upload file" takes one file:
   - the two image files;
   - `upload.sh`, modeled on `dna-thumbs/upload.sh` in the project files: `set -euo pipefail`; one `aws s3 cp` per file with its exact `--content-type` (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, ...) and `--cache-control 'public, max-age=31536000, immutable'`; then a `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' -H 'Referer: https://dna.darthvid.com/'` of both new URLs (expect `200 image/...`).
   - The steps you give the user: upload the zip, `unzip dna-card-<slug>.zip && bash dna-card-<slug>/upload.sh`, then **always** the cleanup: "run `ls -la ~` first, then `rm -rf ~/dna-card-<slug> ~/dna-card-<slug>.zip`". CloudShell's home persists (1 GB per region).
6. **Checks:** `npm run lint`, `npm run check`, `npm test`, `npm run test:e2e`. None of them load the S3 images (localhost fails the bucket's Referer rule), so look at the thumbnail yourself and say that the live load is still unchecked.
7. **Commit and push `claude-experiments`** (this deploys only the preview channel). Don't deploy: going live goes through the `deploy` skill with the user's approval, and **only after they've run `upload.sh`**, or the post-deploy image check opens a `Card images failing on live site` issue.

## Remove

1. Delete the entry from `deck.json` and any `linkedCards` that point to its title. Run the checks and push as above.
2. The S3 objects can stay (nothing links to them). Only if the user wants them gone, give a CloudShell `aws s3 rm` for the two exact keys, to run **after** the removal is live (deleting can't be undone unless bucket versioning is on), with the same `ls -la ~` + cleanup line if it ships as a file.

## Things that need no edit

- The post-deploy image check counts URLs from `deck.json` itself (`imgURL` + `thumbURL` per card), so there's no hardcoded total. Expect `2 × <number of cards>` in that run's summary, and the `class="card-wrap` count in the deploy skill's live check to equal the number of cards.
- CSP: no change while both images are in the bucket. If the user insists on an image elsewhere (CLAUDE.md says don't), that host must be added to `img-src` in `vite.config.js` (the `sveltekit({ csp })` directives), and the Referer check would then test a host we don't control. Say so before doing it. A YouTube card would need `i.ytimg.com` in `img-src` (see the Card bullet in CLAUDE.md).
- `Card.svelte` is never touched for a card change.

## Report

Card title, where it sits in the deck, the two S3 keys, the attached zip and the user's CloudShell steps (upload, then cleanup), the checks run, and the preview URL from the run summary as a clickable link. Say that it is not live yet.
