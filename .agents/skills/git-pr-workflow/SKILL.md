---
name: git-pr-workflow
description: Use when creating phase branches, committing, pushing, or writing Pull Request titles and descriptions in Thun Things. Enforces roadmap rule R3 (one phase = one branch = one PR, one task = small commits), [TYPE] commit format, and PR descriptions that lead with image/GIF evidence.
---

# Git & PR Workflow — Thun Things

Applies roadmap rule R3 ([`docs/superpowers/plans/2026-10-22-roadmap.md`](../../../docs/superpowers/plans/2026-10-22-roadmap.md)). The owner reads PRs visually: **every PR description leads with image/GIF evidence**, and prose is kept short.

## 1. Branches

- One branch per phase from `develop`: `phase/pN-<slug>` (e.g. `phase/p2-catalog-grid`). Rebase onto `develop` after the previous phase merges.
- Never commit to `main` or `develop`. Never force-push a phase branch others may have pulled; the `evidence` branch is append-only (see §4).
- Stage only in-scope files; leave unrelated untracked files untouched.

## 2. Commits

- One task from the phase plan = one or more small commits. Each commit keeps `pnpm typecheck`, `pnpm lint`, `pnpm test` green.
- Format: `[TYPE] Imperative summary` — `[TASK]`, `[FEATURE]`, `[FIX]`, `[ENHANCE]`, `[REFACTOR]`, `[CHORE]`, `[DOCS]`.
- Use a body only when the reason is not obvious (e.g. why a dynamic route was replaced). End with the attribution trailer the session requires.

## 3. Pushing and opening the PR

- One PR per phase into `develop`, title `[TYPE] PN <short summary>`.
- If SSH push is unavailable, push over HTTPS with the owner's `gh` credentials for that one command (no global git config change):
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/zhoang2k2/thun-things.git <branch>`
- Write the body to a file and use `gh pr create --body-file` / `gh pr edit --body-file`.
- After opening, wait for CI (`gh pr checks <n> --watch`) and report the real result.

## 4. Evidence (required for any user-visible change)

### What to capture

- One **GIF per user-facing feature**, scripted with Playwright, **≤ 15 s** (target 3–8 s), 960 px wide, deterministic steps (no manual recording).
- **PNG screenshots** at desktop **1440 px** and mobile **390 px** for each new or changed page.
- Edge states that a reviewer cannot easily reproduce: 404, empty, error, disabled form, reduced motion.
- Docs-only or tooling-only PRs: no evidence; say so in one line.

### How to capture

1. Edit `scripts/evidence/scenarios.mjs` for the phase: one `gif` scenario per feature (call `snap(hold)` after each meaningful step) and `png` scenarios for each new or changed page at 1440 / 390 px.
2. `pnpm evidence` — builds, serves on port 3101 (never reuses another server), writes `evidence-out/` (git-ignored). GIFs are capped at 15 s automatically.
3. **Review every file** (extract a few GIF frames if needed). Anything wrong becomes a fix or a "Known gaps" line.

### Where to host

- `pnpm evidence:publish <pr-number>` commits `evidence-out/` to the orphan **`evidence`** branch under `pr-<number>/` with git plumbing (working tree untouched; parent = current remote `evidence`), pushes it, and prints the Markdown evidence table. Set `EVIDENCE_COMMIT_TRAILER` to append the session's attribution trailer.
- Never merge `evidence` into `develop`. The repo is public, so raw URLs render inline: `https://raw.githubusercontent.com/zhoang2k2/thun-things/evidence/pr-<n>/<file>`. Verify one URL returns `200 image/*` before editing the PR.
- Order: open the PR → `pnpm evidence:publish <n>` → `gh pr edit <n> --body-file`.
- When republishing over the same file names, append `?v=<short-head-sha>` to every evidence URL; `raw.githubusercontent.com` caches for several minutes.

## 5. PR description template

Lead with evidence; keep everything else short; collapse details.

```markdown
## Summary

- Up to three bullets: phase, what the user can now see or do, test status.

## Evidence

| Feature                  | Evidence                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| <feature in plain words> | ![<feature>](https://raw.githubusercontent.com/zhoang2k2/thun-things/evidence/pr-<n>/01-<feature>.gif)             |
| <page>, desktop 1440 px  | <img src="https://raw.githubusercontent.com/zhoang2k2/thun-things/evidence/pr-<n>/<page>-desktop.png" width="480"> |
| <page>, mobile 390 px    | <img src="https://raw.githubusercontent.com/zhoang2k2/thun-things/evidence/pr-<n>/<page>-mobile.png" width="200">  |

**Known gaps:** <anything the evidence shows that is out of scope or deferred, or "None">.

<details>
<summary>Changes</summary>

- Grouped by area, one line each.

</details>

<details>
<summary>How to test</summary>

1. Numbered steps.

</details>

## Verification

- Checks actually run and their results; what was not run and why.
```

Rules: English, no emojis, no invented evidence or results, no empty sections in a finished PR. Evidence must come from the PR's own head commit.
