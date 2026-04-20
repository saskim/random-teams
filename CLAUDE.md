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

- `main` — production; protected, no direct pushes
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

## Deployment

- **Platform**: Railway — auto-deploys on push to `main` via GitHub integration
- **Build**: Docker (`railway.toml` + `Dockerfile`)
- Build output: `dist/random-teams/browser/`
