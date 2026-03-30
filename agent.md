# agent.md — vibe-check project notes

## Project Overview
- **Name**: vibe-check
- **Purpose**: CLI tool that gives any API endpoint a personality report
- **NPM name**: `vibe-check` (available as of 2026-03-30)
- **Runtime**: Node.js >= 18, also supports Bun
- **Package type**: ESM (`"type": "module"`)

## Architecture
```
bin/index.js          → shebang entry point, calls src/cli.js
src/cli.js            → Commander.js arg parsing, orchestrates pipeline
src/probe.js          → Fires N sequential HTTP requests, collects raw data
src/analyzers/        → 5 analyzer modules (speed, consistency, size, honesty, headers)
src/verdict.js        → Combines analyzer scores → personality label
src/roast.js          → Template-based one-liner roast generator
src/ui/terminal.js    → Terminal rendering (chalk, boxen, cli-table3)
src/ui/share.js       → GitHub Gist sharing via `gh` CLI
```

## Pipeline Flow
1. Parse CLI args (Commander)
2. Print header box
3. Fire N HTTP requests with progress spinner
4. Run 5 analyzers on raw results
5. Compute weighted verdict (speed 30%, consistency 25%, honesty 20%, size 15%, headers 10%)
6. Generate roast based on worst trait
7. Render terminal output or JSON
8. Optionally share via Gist

## Dependencies (kept minimal for fast npx)
- commander, chalk, ora, boxen, cli-table3

## Key Design Decisions
- Sequential requests (not parallel) to measure real response behavior
- No external API calls or accounts needed
- `fetch` is used natively (Node 18+)
- Scoring is 0-100 per trait, weighted into overall score
- Personality labels are fun but scoring logic is real/useful
- Gist sharing uses `gh` CLI (graceful fallback if not installed)

## Gotchas
- ora spinner overwrites header box in some terminals — known cosmetic issue
- Consistency scoring with < 5 requests may be unreliable (small sample)
- `performance.now()` precision varies between Node and Bun

## TODOs (v2)
- `--compare <url1> <url2>` head-to-head mode
- `--watch` continuous monitoring
- GitHub Actions integration
- Clipboard copy of report
