---
name: card-drift
description: Check whether Card.svelte differs between darthvid.com (tehdarthvid.github.io, the reference) and dna.darthvid.com (dna-svelte), and report any divergence. Use after changing Card.svelte in either repo, before a deploy of either site, or when the user asks whether the cards are in sync.
---

# Card drift check

`Card.svelte` is shared, with `tehdarthvid.github.io` as the reference (see `CLAUDE.md`). Keeping it in sync is a **soft rule**: a site may lag or diverge on purpose, but every divergence must be reported to the user, in the post for the change that caused it or found it. This skill is the same file in both repos.

## Check

Compare the working copy (or a branch) against the other repo's `claude-experiments`. Both repos are public, so raw GitHub works from either repo without a sibling clone:

```sh
raw=https://raw.githubusercontent.com/tehdarthvid
f=src/lib/components/Card.svelte
curl -sfS -m 20 "$raw/tehdarthvid.github.io/claude-experiments/$f" -o /tmp/card-ref.svelte
curl -sfS -m 20 "$raw/dna-svelte/claude-experiments/$f" -o /tmp/card-dna.svelte
# in either repo, also compare your uncommitted copy with the other side:
diff -u /tmp/card-ref.svelte /tmp/card-dna.svelte && echo "in sync (claude-experiments)"
diff -u /tmp/card-ref.svelte "$f"                  # from dna-svelte: local vs reference
```

If a sibling clone sits next to this repo (as on the user's computer), `diff -u ../tehdarthvid.github.io/$f ../dna-svelte/$f` is enough. Also compare what's **live** when it matters (before a deploy, or if the user asks): the deploy branches are `dev` (github.io) and `master` (dna), so swap `claude-experiments` for those in the URLs. Gotchas: raw GitHub is cached for a few minutes after a push (on 2026-11-16 one fetch of `dev` briefly differed and then matched; likely that cache), so for the repo you're in prefer `git fetch origin <branch> && git show origin/<branch>:$f`, and re-fetch before reporting drift right after a push. `curl -f` fails on a 404, which means the file moved; say so rather than reporting drift.

## Report

- **In sync:** one line, saying which branches were compared.
- **Diverged:** which side is behind or ahead (use `git log -1 --format='%h %cs %s' -- src/lib/components/Card.svelte` in each repo, or the GitHub commits page for that path), a short summary of the diff (props, markup, styles, effects), and whether it looks deliberate (e.g. a dna experiment) or accidental (a sync was missed). That judgment is an inference; say so.
- Then offer, don't do: copy the reference into dna (`Sync Card.svelte from tehdarthvid.github.io` commits), or port a dna change back to the reference. A dna experiment that adds complexity must not move into darthvid.com without the user's OK (CLAUDE.md, site philosophy). Site-specific behavior belongs in each site's `Deck.svelte`, not in Card.
- Each repo's own tests cover its copy; after a sync, run that repo's checks before pushing `claude-experiments`.
