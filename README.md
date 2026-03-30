# 🔮 vibe-check

> Give any API a personality report.

One command. One URL. One vibe.

```bash
npx vibe-check https://api.example.com/users
```

or with Bun:

```bash
bunx vibe-check https://api.example.com/users
```

## What is this?

Point `vibe-check` at any API endpoint, and instead of boring technical metrics, you get a **personality report** — a fun, opinionated verdict on whether that API is trustworthy, bloated, fast, moody, or just *cooked*.

Think of it like a code linter, but for API behavior. Instead of just showing numbers, it gives you a character assessment.

## The Verdict Labels

| Score | Label | Emoji | Meaning |
|-------|-------|-------|---------|
| 90–100 | **Immaculate** | ✨ | Elite. Genuinely impressive. |
| 75–89 | **Snappy** | ⚡ | Fast, reliable, well-mannered. |
| 60–74 | **Chill** | 😎 | Gets the job done, no drama. |
| 40–59 | **Mid** | 🫤 | It works... technically. |
| 25–39 | **Sleepy** | 😴 | Needs a coffee and a stern talk. |
| 10–24 | **Chaotic** | 🌀 | A gambling experience. |
| 0–9 | **Cooked** | 💀 | Thoughts and prayers. |

## What it analyzes

- **⚡ Speed** — Response times (avg, p50, p95)
- **📏 Consistency** — Variance and reliability across requests
- **📦 Size** — Payload bloat and compression
- **🪟 Honesty** — Are status codes truthful?
- **🏰 Headers** — Security posture and best practices

## Usage

```bash
# Basic usage
npx vibe-check https://api.example.com/endpoint

# Custom request count
npx vibe-check https://api.example.com/endpoint --requests 50

# POST request with body
npx vibe-check https://api.example.com/create -m POST -b '{"name": "test"}'

# Add custom headers
npx vibe-check https://api.example.com/secure -H "Authorization: Bearer token123"

# Get raw JSON output
npx vibe-check https://api.example.com/endpoint --json

# Share via GitHub Gist
npx vibe-check https://api.example.com/endpoint --share
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-n, --requests <n>` | Number of requests to fire | 20 |
| `-m, --method <method>` | HTTP method | GET |
| `-H, --header <header>` | Custom headers (repeatable) | — |
| `-b, --body <json>` | Request body (JSON) | — |
| `-t, --timeout <ms>` | Request timeout | 10000 |
| `--json` | Output raw JSON | — |
| `--share` | Share report via GitHub Gist | — |
| `--no-color` | Disable colors | — |

## Sharing

Share your API's vibe report with the `--share` flag. It creates a public GitHub Gist with a beautiful markdown report:

```bash
npx vibe-check https://api.example.com/endpoint --share
# → Share your vibe report → https://gist.github.com/abc123
```

Requires [GitHub CLI](https://cli.github.com) (`gh`) to be installed and authenticated.

## Use Cases

- **Evaluating third-party APIs** before committing to them
- **Debugging staging environments** — why does this feel slow?
- **Sanity-checking your own service** before launching
- **PR comments** — drop a vibe report when changing API behavior
- **Bragging rights** — post your API's ✨ Immaculate score

## Requirements

- Node.js >= 18 or Bun

## License

MIT
