// ---------------------------------------------------------------------------
// build-news.js – Main script: fetch → classify → dedupe → write news.json
// ---------------------------------------------------------------------------
// Run with:  npm run build-news
//
// This script:
//   1. Fetches RSS feeds from the configured sources
//   2. Normalises each item into a common shape
//   3. Classifies items using keyword rules (AI or Finance)
//   4. Deduplicates by URL, title, and fuzzy similarity (per domain)
//   5. Sorts by recency, limits per category
//   6. Writes docs/news.json
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

import sources from "./sources.js";
import { classify, classifyFinance } from "./classify.js";
import { deduplicate } from "./dedupe.js";
import { fetchTrends } from "./build-trends.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ITEMS_PER_CATEGORY = 15;
const REQUEST_TIMEOUT_MS = 8_000;

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
    const classifyFn = source.domain === "finance" ? classifyFinance : classify;
    try {
        const feed = await parser.parseURL(source.url);
        const items = (feed.items || []).map((entry) => {
            const item = {
                title: (entry.title || "").trim(),
                url: (entry.link || "").trim(),
                source: source.name,
                publishedAt: safeDate(entry.isoDate || entry.pubDate).toISOString(),
            };
            item.category = classifyFn(item, source.defaultCategory);
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
        headers: { "User-Agent": "news-dashboard/1.0" },
    });

    // Partition sources by domain
    const aiSources = sources.filter((s) => s.domain === "ai");
    const financeSources = sources.filter((s) => s.domain === "finance");

    // Fetch market trend news, AI sources, and finance sources all concurrently
    console.log("Fetching market trends…");
    const [trends, aiResults, finResults] = await Promise.all([
        fetchTrends().catch((err) => {
            console.warn("Failed to fetch trends:", err.message);
            return [];
        }),
        Promise.all(aiSources.map((src) => fetchSource(src, parser))),
        Promise.all(financeSources.map((src) => fetchSource(src, parser))),
    ]);

    const aiItems = aiResults.flat();
    const finItems = finResults.flat();
    console.log(`\nTotal raw items – AI: ${aiItems.length}, Finance: ${finItems.length}`);

    // Sort newest-first before dedup (per domain)
    const sortByDate = (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    aiItems.sort(sortByDate);
    finItems.sort(sortByDate);

    // Deduplicate per domain
    const uniqueAI = deduplicate(aiItems);
    const uniqueFin = deduplicate(finItems);
    console.log(`After dedup – AI: ${uniqueAI.length}, Finance: ${uniqueFin.length}`);

    // Bucket into categories
    const aiBuckets = { developers: [], everyone: [], advancements: [] };
    for (const item of uniqueAI) {
        if (aiBuckets[item.category]) {
            aiBuckets[item.category].push(item);
        }
    }

    const finBuckets = { markets: [], crypto: [] };
    for (const item of uniqueFin) {
        if (finBuckets[item.category]) {
            finBuckets[item.category].push(item);
        }
    }

    // Limit per category
    for (const cat of Object.keys(aiBuckets)) {
        aiBuckets[cat] = aiBuckets[cat].slice(0, ITEMS_PER_CATEGORY);
        console.log(`  ai.${cat}: ${aiBuckets[cat].length} items`);
    }
    for (const cat of Object.keys(finBuckets)) {
        finBuckets[cat] = finBuckets[cat].slice(0, ITEMS_PER_CATEGORY);
        console.log(`  finance.${cat}: ${finBuckets[cat].length} items`);
    }

    // Build output
    const output = {
        lastUpdated: new Date().toISOString(),
        ai: {
            developers: aiBuckets.developers,
            everyone: aiBuckets.everyone,
            advancements: aiBuckets.advancements,
        },
        finance: {
            markets: finBuckets.markets,
            crypto: finBuckets.crypto,
        },
        trends,
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
