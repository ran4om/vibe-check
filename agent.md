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
src/ui/share.js       → URL generation (hash-based) + GitHub Gist via `gh` CLI
web/index.html        → Vercel-hosted shareable report page (static, reads hash params)
vercel.json           → Vercel deployment config
```

## Pipeline Flow
1. Parse CLI args (Commander)
2. Print header box
3. Fire N HTTP requests with progress spinner
4. Run 5 analyzers on raw results
5. Compute weighted verdict (speed 30%, consistency 25%, honesty 20%, size 15%, headers 10%)
6. Generate roast based on worst trait (returns { text, index } — index 0-29)
7. Generate shareable URL with hash params
8. Render terminal output or JSON
9. Optionally share via Gist (--gist flag)

## Dependencies (kept minimal for fast npx)
- commander, chalk, ora, boxen, cli-table3

## Key Design Decisions
- Sequential requests (not parallel) to measure real response behavior
- No external API calls or accounts needed
- `fetch` is used natively (Node 18+)
- Scoring is 0-100 per trait, weighted into overall score
- 6 personality tiers with numeric IDs: 1=Snappy, 2=Sleepy, 3=Chaotic, 4=Chill, 5=Chunky, 6=Cooked
- Roasts are a flat indexed array of 30 entries (0-29), shared between CLI and web frontend
- Shareable URL format: `https://api-vibecheck.vercel.app/#u=<url>&v=<vibeId>&s=<5 scores>&t=<4 stats>&r=<roastIndex>`
- Web Frontend UI is built from a high-end Stitch editorial design ("Personality Quiz - Vibe Check")
- Design System: Dark mode, Epilogue (Headlines), Manrope (Body), Space Grotesk (Labels), with vibrant "liquid gold" accents.
- Gist sharing uses `gh` CLI (graceful fallback if not installed)

## Shareable URL Spec
Format: `https://api-vibecheck.vercel.app/#u=<url>&v=<vibeId>&s=<scores>&t=<stats>&r=<roastIndex>`
- `u` = target URL (no protocol, URI-encoded)
- `v` = vibe ID (1-6)
- `s` = 5 trait scores comma-separated: speed,consistency,size,honesty,headers
- `t` = 4 stats comma-separated: avg_ms,p50_ms,p95_ms,payload_bytes
- `r` = roast index (0-29) into the hardcoded ROASTS array

## Gotchas
- ora spinner overwrites header box in some terminals — known cosmetic issue
- Consistency scoring with < 5 requests may be unreliable (small sample)
- `performance.now()` precision varies between Node and Bun
- OG meta tags on web page are static (hash params aren't server-readable)

## TODOs (v2)
- `--compare <url1> <url2>` head-to-head mode
- `--watch` continuous monitoring
- GitHub Actions integration
- Dynamic OG images via Vercel Edge Function
- Clipboard copy of report
