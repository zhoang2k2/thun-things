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

### How to capture (until `pnpm evidence` exists — planned in P2)

1. `pnpm build && pnpm start --port 3101` (a dedicated port; never reuse another project's server). Stop it afterwards.
2. A Playwright script opens each scenario, takes a screenshot per step into `frames/<NN-feature>/`, and repeats a frame to hold on meaningful states.
3. Assemble frames into GIFs (e.g. Pillow in a scratch virtualenv, ~140 ms per frame, 64-colour palette). Do not add image tooling to the project dependencies for this.
4. Look at the frames before publishing; anything wrong becomes a fix or a "Known gaps" line.

### Where to host

- Orphan branch **`evidence`**, one folder per PR: `pr-<number>/<NN-feature>.gif`, `pr-<number>/<page>-<desktop|mobile>.png`. Never merge it into `develop`.
- Commit with plumbing (`git hash-object -w`, `git mktree`, `git commit-tree` with the previous `evidence` commit as parent, `git update-ref`) so the working tree is untouched, then push `evidence:evidence`.
- Embed with raw URLs (the repo is public): `https://raw.githubusercontent.com/zhoang2k2/thun-things/evidence/pr-<n>/<file>`. Verify one URL returns `200 image/*` before editing the PR.

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
