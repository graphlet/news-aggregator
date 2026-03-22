// ---------------------------------------------------------------------------
// build-news.js – Main script: fetch → classify → dedupe → write news.json
// ---------------------------------------------------------------------------
// Run with:  npm run build-news
//
// This script:
//   1. Fetches RSS feeds from the configured sources
//   2. Normalises each item into a common shape
//   3. Classifies items using keyword rules
//   4. Deduplicates by URL, title, and fuzzy similarity
//   5. Sorts by recency, limits per category
//   6. Writes docs/news.json
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

import sources from "./sources.js";
import { classify } from "./classify.js";
import { deduplicate } from "./dedupe.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ITEMS_PER_CATEGORY = 15;
const REQUEST_TIMEOUT_MS = 15_000;

// Resolve paths relative to this script file
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "..", "docs", "news.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Try to parse a date string; fall back to now. */
function safeDate(raw) {
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
}

/** Fetch a single RSS feed and return normalised items. */
async function fetchSource(source, parser) {
    try {
        const feed = await parser.parseURL(source.url);
        const items = (feed.items || []).map((entry) => {
            const item = {
                title: (entry.title || "").trim(),
                url: (entry.link || "").trim(),
                source: source.name,
                publishedAt: safeDate(entry.isoDate || entry.pubDate).toISOString(),
            };
            item.category = classify(item, source.defaultCategory);
            return item;
        });
        console.log(`  ✓ ${source.name}: ${items.length} items`);
        return items;
    } catch (err) {
        console.warn(`  ✗ ${source.name}: ${err.message}`);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    console.log("Fetching sources…");

    const parser = new Parser({
        timeout: REQUEST_TIMEOUT_MS,
        headers: { "User-Agent": "ai-news-dashboard/1.0" },
    });

    // Fetch all sources concurrently
    const results = await Promise.all(
        sources.map((src) => fetchSource(src, parser))
    );
    const allItems = results.flat();
    console.log(`\nTotal raw items: ${allItems.length}`);

    // Sort all items newest-first before dedup so the first occurrence kept is the newest
    allItems.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Deduplicate
    const unique = deduplicate(allItems);
    console.log(`After deduplication: ${unique.length}`);

    // Bucket into categories
    const buckets = { developers: [], everyone: [], advancements: [] };
    for (const item of unique) {
        if (buckets[item.category]) {
            buckets[item.category].push(item);
        }
    }

    // Limit per category
    for (const cat of Object.keys(buckets)) {
        buckets[cat] = buckets[cat].slice(0, ITEMS_PER_CATEGORY);
        console.log(`  ${cat}: ${buckets[cat].length} items`);
    }

    // Build output
    const output = {
        lastUpdated: new Date().toISOString(),
        developers: buckets.developers,
        everyone: buckets.everyone,
        advancements: buckets.advancements,
    };

    // Ensure docs/ exists and write
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
    console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
