# RandomTeams — Claude Code Guide

## Stack

- **Framework**: Angular (standalone components, signals) — see `package.json` for versions
- **UI**: Angular Material + Angular CDK
- **Database**: Dexie (IndexedDB wrapper) with dexie-export-import
- **State**: RxJS services
- **Testing**: Karma + Jasmine
- **Package manager**: pnpm (use `pnpm`, never `npm` or `yarn`)
- **Language**: TypeScript

## Key Commands

```bash
pnpm start          # dev server at http://localhost:4200
pnpm build          # production build → dist/
pnpm test           # unit tests (Karma/Chrome)
pnpm run watch      # dev build with watch
ng generate component src/app/<feature>/<name>  # scaffold a component
```

## Project Structure

```
src/app/
  db/               # Dexie database definition
  services/         # RxJS services (one per domain)
  players/          # Players feature
  teams/            # Teams feature
  tournaments/      # Tournaments feature
  scoreboard/       # Scoreboard feature
```

## Conventions

- **Components**: standalone, use `inject()` not constructor injection
- **Services**: injectable at root, return `Observable` or `Signal`
- **Styles**: SCSS per component, no global style overrides
- **Naming**: `kebab-case` for files, `PascalCase` for classes, `camelCase` for methods/props
- **Tests**: co-located `.spec.ts` files, test service logic not implementation details
- **No barrel files** (`index.ts`) except in `db/`

## Branching Strategy

- `main` — production; protected, no direct pushes or commits
- `feature/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — deps, tooling, config

## PR Conventions

- Title: `<type>: <short description>` (e.g. `feat: add tournament bracket view`)
- Keep PRs focused — one logical change per PR
- All tests must pass before merge
- Merge commit to main (preserves full branch history)

## Worktrees

When creating a worktree, use the branching convention if the work is clear:

```bash
claude --worktree feat/add-tournament-bracket
claude --worktree fix/player-score-reset
claude --worktree chore/upgrade-angular
```

If the scope isn't clear yet, omit the name and let Claude generate a random one. Rename the branch before opening a PR.

## Claude in the PR Flow

### Typical workflow

1. **Branch** — start on a `feature/`, `fix/`, or `chore/` branch (worktree or plain checkout).
2. **Code + tests** — Claude writes logic and the accompanying `.spec.ts` tests in the same pass. No untested logic ships.
3. **Hooks run automatically** — `after-edit` lints on every file save; `on-stop` runs Playwright when component files change.
4. **Self-review** — before opening a PR, run `/review` to have Claude check the diff for issues, gaps in test coverage, and CLAUDE.md convention violations.
5. **Open the PR** — Claude creates it with `gh pr create`, following the title convention (`type: description`) and including a summary + test plan in the body.
6. **CI gate** — GitHub Actions must go green (lint → build → tests) before merge.
7. **Merge** — merge commit into `main`; Railway auto-deploys.

### What Claude does vs. what you decide

| Claude handles                     | You decide                                     |
| ---------------------------------- | ---------------------------------------------- |
| Writing code and tests             | Whether the feature is the right one to build  |
| Conventional commit messages       | Whether the PR scope is correct                |
| PR description and test plan       | Approving and merging the PR                   |
| Running and interpreting CI output | Accepting or rejecting visual snapshot changes |

### Useful slash commands in this project

- `/review` — review the current branch diff before opening a PR
- `/security-review` — check pending changes for security issues

## Testing

### Commands

```bash
pnpm test                                              # interactive (Karma/Chrome, watch mode)
ng test --watch=false --browsers=ChromeHeadless        # headless single run (CI / hooks)
```

### Conventions

- Co-located `.spec.ts` files — one per source file
- Test **behaviour and logic**, not implementation details or that a class instantiates
- Services wrap Dexie directly — stub the `db` import or use a fake IndexedDB rather than calling the real database
- Components: test public methods and computed properties (e.g. getters); avoid asserting on DOM structure
- Claude writes tests alongside any logic it adds or changes — do not ship untested logic

### What to test

Focus on code that contains decisions or calculations:

- **`TeamsComponent`** — `noOfTeamsToGenerate` getter, `generateRandomTeams` distribution logic, `initializeTeams` naming
- **`TeamService.getTeams`** — `totalRating` and `averageRating` calculations
- **`TournamentService.deleteTournament`** — verify associated matches are also deleted

Pure Dexie CRUD delegations (add/update/delete with no logic) do not need unit tests.

## Visual / E2E Testing

### Commands

```bash
pnpm e2e                  # run Playwright smoke + visual + analysis tests
pnpm e2e:update           # update snapshot baselines after intentional UI changes
pnpm exec playwright show-report   # open last HTML report in browser
```

### How it works

- `e2e/smoke.spec.ts` — navigates all 4 routes, asserts titles, and compares screenshots against baselines (`toHaveScreenshot`)
- `e2e/analyse.spec.ts` — captures fresh screenshots and sends them to Claude for visual review; skipped if `ANTHROPIC_API_KEY` is not set
- First run creates snapshot baselines; subsequent runs diff against them
- On failure the hook opens the HTML report in the browser showing side-by-side diffs

### When the hook runs visual tests

The `on-stop` hook only runs Playwright when `*.component.{html,ts,scss}` files are modified. For unrelated changes (services, tests, config) it is skipped.

### Updating baselines

Run `pnpm e2e:update` after intentional UI changes to accept the new screenshots as the new baseline.

## Git Hooks

Hooks live in `.githooks/` and are activated by `pnpm prepare` (runs automatically after `pnpm install`).

| Hook         | When it runs        | What it does                                                        |
| ------------ | ------------------- | ------------------------------------------------------------------- |
| `commit-msg` | Every commit        | Validates conventional commit format (`type: description`)          |
| `pre-push`   | Push to `main` only | Runs full test suite + production build; blocks the push on failure |

After cloning, run `pnpm install` (or `pnpm prepare`) once to activate the hooks.

### Conventional commit format

```
<type>[optional scope]: <description>
```

- **type** (required): `feat` · `fix` · `chore` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `revert`
- **scope** (optional): lowercase, in parentheses — names the affected area, e.g. `(players)`, `(teams)`
- **description**: max 100 characters; sentence-case, no trailing period

Examples:

```
feat: add tournament bracket view
fix(players): prevent duplicate names
chore: upgrade angular to v22
```

Merge commits are exempt. All other commits are validated by the `commit-msg` hook.

## CI / CD

### CI (GitHub Actions — `.github/workflows/ci.yml`)

Runs on every push and PR targeting `main`:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Lint (`pnpm lint`)
3. Build (`pnpm build`)
4. Unit tests headless (`ng test --watch=false --browsers=ChromeHeadless`)

All steps must pass before a PR can be merged.

### Deploy (Railway)

- **Platform**: Railway — auto-deploys on push to `main` via GitHub integration (no GitHub Actions step needed)
- **Build**: Docker — `railway.toml` points to `Dockerfile`
- **Runtime**: Node + `serve` on port 8080 (set via `PORT` env var in Railway)
- Build output served: `dist/random-teams/browser/`
- No secrets or env vars are required for the app itself (it runs entirely client-side)
- `ANTHROPIC_API_KEY` is only used locally for the Playwright `analyse.spec.ts` test — it is not needed at build or runtime on Railway
