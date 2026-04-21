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

## Deployment

- **Platform**: Railway — auto-deploys on push to `main` via GitHub integration
- **Build**: Docker (`railway.toml` + `Dockerfile`)
- Build output: `dist/random-teams/browser/`
