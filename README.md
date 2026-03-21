# AI News Dashboard

A lightweight static website that aggregates recent AI news links and groups them into three practical sections. Designed for simplicity, low cost, and easy deployment on GitHub Pages.

## What It Does

- Fetches RSS feeds from a small set of high-signal AI news sources
- Classifies articles into **For Developers**, **For Everyone**, and **Sector Advancements**
- Deduplicates articles by URL and title similarity
- Writes a static `news.json` file
- Serves a clean, mobile-friendly HTML dashboard that loads `news.json` client-side
- Refreshes automatically every 3 hours via GitHub Actions

## Project Structure

```
.github/workflows/update-news.yml   # Scheduled GitHub Actions workflow
scripts/
  build-news.js                      # Main script: fetch → classify → dedupe → write
  sources.js                         # RSS feed source configuration
  classify.js                        # Keyword-based classification rules
  dedupe.js                          # URL and title deduplication
docs/
  index.html                         # Static dashboard page
  styles.css                         # Plain CSS styles
  app.js                             # Client-side rendering logic
  news.json                          # Generated news data (committed by Actions)
package.json                         # Node.js project config
README.md                            # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ (20 recommended)
- npm

### Install and Build

```bash
npm install
npm run build-news
```

This fetches all configured feeds and writes `docs/news.json`.

### Preview Locally

Option 1 — use the built-in serve script:

```bash
npm run serve
```

Then open http://localhost:3000 in your browser.

Option 2 — use Python's built-in server:

```bash
cd docs && python3 -m http.server 8000
```

Then open http://localhost:8000.

> **Note**: Opening `docs/index.html` directly as a file won't work because `fetch()` requires an HTTP server.

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Set the branch to `main` and the folder to `/docs`
5. Save — the site will be live at `https://<username>.github.io/<repo-name>/`

The `docs/` folder contains everything needed. No build step is required on the Pages side.

## GitHub Actions Scheduled Refresh

The workflow at `.github/workflows/update-news.yml`:

- Runs **every 3 hours** via cron (`0 */3 * * *`)
- Can also be triggered **manually** from the Actions tab (workflow_dispatch)
- Installs dependencies, runs the build script, and commits `docs/news.json` only if it changed
- Uses `[skip ci]` in the commit message to avoid triggering unnecessary CI runs

### Permissions

The workflow needs write access to push commits. This is configured via `permissions: contents: write` in the workflow file. For public repos this works automatically.

## Adding or Removing Sources

Edit `scripts/sources.js`. Each source is an object with:

```js
{
  name: "Display Name",             // shown in the dashboard
  url: "https://example.com/rss",   // RSS feed URL
  defaultCategory: "developers",    // fallback: "developers" | "everyone" | "advancements"
}
```

- To **add** a source: append an entry to the array
- To **remove** a source: delete or comment out the entry
- Then run `npm run build-news` to test

## Classification

Classification is **rule-based** (no AI/LLM). See `scripts/classify.js`.

The logic checks the article title against keyword lists, in order:

1. **Developer keywords** (`api`, `sdk`, `open source`, `github`, `framework`, `tutorial`, `benchmark`, etc.) → **For Developers**
2. **Advancement keywords** (`research`, `breakthrough`, `chip`, `regulation`, `safety`, `agi`, `funding`, etc.) → **Sector Advancements**
3. **Everyone keywords** (`chatgpt`, `gemini`, `consumer`, `app`, `launch`, `update`, etc.) → **For Everyone**
4. **Fallback**: the source's `defaultCategory`

First match wins. To adjust, edit the keyword arrays in `classify.js`.

## Deduplication

See `scripts/dedupe.js`. Three passes:

1. **Exact URL match** — normalised (lowercase, trailing slash stripped)
2. **Exact title match** — normalised (lowercase, punctuation stripped, whitespace collapsed)
3. **Fuzzy title similarity** — word-level Jaccard index ≥ 0.8 is treated as a duplicate

In all cases the first occurrence (most recent) is kept.

## Scripts

| Command | Description |
|---|---|
| `npm run build-news` | Fetch feeds and generate `docs/news.json` |
| `npm run serve` | Start a local static server for `docs/` |

## Error Handling

The build script is resilient:

- If a feed is unreachable or returns invalid XML, it logs a warning and continues
- Missing published dates fall back to the current time
- Malformed items are skipped
- If all sources fail, an empty (but valid) `news.json` is still written

## License

MIT
