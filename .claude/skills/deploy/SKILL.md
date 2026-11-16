---
name: deploy
description: Deploy this site to dna.darthvid.com. Checks claude-experiments locally, pushes it (CI deploys a preview), then after confirmation merges it into master without the Claude-only files, watches the live deploy and checks the live site. Use when the user asks to deploy, ship, release or publish changes.
---

# Deploy dna.darthvid.com

Deployment is CI-only (`.github/workflows/fb-deploy.yml`, Firebase Hosting). Pushing `claude-experiments` runs every check and deploys to the `claude-experiments` preview channel (7-day expiry, no GA). Pushing `master` deploys live. There is no local deploy script.

## Rules

- Work happens on `claude-experiments`. `master` is only touched to deploy.
- Claude-only files (`CLAUDE.md` anywhere, `.claude/`) stay on `claude-experiments` and never go to `master`. So `master` is never a fast-forward: each deploy is a merge commit without those paths.
- Never push `master` unless the user asked for a deploy. Confirm before step 5 even if they said "deploy" earlier in the session, unless they said to go all the way.
- Never force-push or rebase. If the merge in step 5 conflicts on anything other than the Claude-only files, stop, show both sides and ask.
- Do not push with failing checks. Report failures with the output.
- Git auth goes through the Bitwarden SSH agent via Windows `ssh.exe` (see the workspace `CLAUDE.md`, "Git auth"). With the vault locked, a push or pull waits for the user to approve a Bitwarden prompt, so a slow one isn't a failure: don't kill it, ask the user to check Bitwarden. If it fails outright, suspect a locked vault or a missing GitHub entry in `C:\Users\simoun\.ssh\known_hosts`. Do not load keys yourself.
- Do not change the workflow's Node version to 26: `firebase-tools` only supports Node 20-24, and `.npmrc` `engine-strict` makes the deploy fail.

## Steps

1. **Preflight.** `git branch --show-current` must be `claude-experiments` (switch if not). `git status` must be clean; if not, ask whether to commit. `git fetch origin`.
2. **Local checks.** `npm run lint`, `npm run check`, `npm test`, `npm run test:e2e`. The user's shell exports placeholder `PUBLIC_*` values; that doesn't matter for these checks. Use Node 24 (the shell default). If every e2e test fails with "Executable doesn't exist", Playwright was bumped: run `npx playwright install chromium` and rerun.
3. **Push `claude-experiments` and watch CI.** Find the run by commit, not "latest", since an older run may still be listed:

   ```sh
   git push origin claude-experiments
   sha=$(git rev-parse HEAD)
   # wait a few seconds for the run to be created
   id=$(gh run list --branch claude-experiments --limit 5 --json databaseId,headSha -q ".[] | select(.headSha==\"$sha\") | .databaseId" | head -1)
   gh run watch "$id" --exit-status
   ```

   If nothing was pushed (already up to date), use the most recent successful run for that commit. The preview URL is in the run summary (`gh run view "$id" --log | grep -o 'Deployed to https://[^ "]*'`). Give it to the user.

4. **Confirm the deploy.** Show what will go live: `git diff --stat origin/master origin/claude-experiments -- . ':!**/CLAUDE.md' ':!.claude'` plus the commit list `git log --oneline origin/master..origin/claude-experiments`. If the diff is empty, there's nothing to deploy (Claude-only changes don't deploy); say so and stop. Ask the user to confirm, mentioning the preview URL so they can check it first.
5. **Merge into `master` without the Claude-only files.**

   ```sh
   git fetch origin
   git checkout -B deploy-tmp origin/master
   git merge --no-ff --no-commit origin/claude-experiments   # a modify/delete conflict on CLAUDE.md is expected
   git rm -rqf --ignore-unmatch CLAUDE.md .claude           # -f: the merge stages them, and plain rm refuses
   git ls-files -z '*CLAUDE.md' | xargs -0r git rm -qf       # nested CLAUDE.md, if any
   git status --short                                       # must show no other conflicts; if it does, stop and ask
   git commit -m "Deploy claude-experiments to master (without Claude-only files)"
   git diff --name-only origin/claude-experiments HEAD      # must list only Claude-only paths
   git ls-tree -r --name-only HEAD | grep -E 'CLAUDE\.md|^\.claude/'   # must print nothing
   git push origin HEAD:master
   git checkout claude-experiments && git branch -D deploy-tmp
   ```

   Never merge `master` back into `claude-experiments` (it would delete the Claude-only files there), and never force-push.

6. **Watch the live deploy** the same way as step 3 with `--branch master`. Every step must succeed.
7. **Check the live site** (Firebase's CDN can lag a minute; retry before calling anything a failure):
   - `curl -sI https://dna.darthvid.com/`: HTTP 200, and the headers from `firebase.json`: `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `x-permitted-cross-domain-policies`.
   - In the HTML (`curl -s https://dna.darthvid.com/`):
     - The short commit hash of `master` is shown.
     - The CSP meta has `connect-src` with the Google Analytics hosts.
     - There's a `gtag/js?id=G-` script. Don't hardcode or print the full ID.
     - `svelte v<version>` matches `node -p "require('svelte/package.json').version"`.
     - The number of `class="card-wrap` matches the number of entries in `src/lib/data/deck.json`.
8. **Report** the commits deployed, the run, and each check's result. `master` now matches `claude-experiments` except for the Claude-only files.
9. **Pending cleanup.** Check memory for repo secrets waiting to be deleted after successful deploys, and remind the user if they're due. Writing secrets is blocked for Claude, so the user runs the `gh secret delete` commands.

## Repo settings this relies on

Repo secrets `FIREBASE_SERVICE_ACCOUNT` (Firebase Hosting Admin) and `GA_TRACKING_ID`; repo variable `FIREBASE_PROJECT_ID` (a variable, so preview URLs aren't masked in logs). The custom domain `dna.darthvid.com` is configured in Firebase Hosting.
