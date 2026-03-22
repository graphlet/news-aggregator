// ---------------------------------------------------------------------------
// build-trends.js – Fetch market trend news from RSS feeds
// ---------------------------------------------------------------------------
// Returns an array of news items about market trends (indices, economy, etc.)
// sourced from RSS feeds instead of Yahoo Finance chart API.
// ---------------------------------------------------------------------------

import Parser from "rss-parser";

const REQUEST_TIMEOUT_MS = 8_000;

const TREND_SOURCES = [
    {
        name: "MarketWatch",
        url: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    },
    {
        name: "Investing.com – Economy",
        url: "https://www.investing.com/rss/news_14.rss",
    },
    {
        name: "Financial Times",
        url: "https://www.ft.com/rss/home",
    },
    {
        name: "Bloomberg Markets",
        url: "https://feeds.bloomberg.com/markets/news.rss",
    },
];

/** Try to parse a date string; fall back to now. */
function safeDate(raw) {
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Fetch market trend news from RSS feeds.
 * Returns an array of news items ready to be embedded in news.json.
 */
export async function fetchTrends() {
    const parser = new Parser({
        timeout: REQUEST_TIMEOUT_MS,
        headers: { "User-Agent": "news-dashboard/1.0" },
    });

    const results = await Promise.all(
        TREND_SOURCES.map(async (source) => {
            try {
                const feed = await parser.parseURL(source.url);
                const items = (feed.items || []).map((entry) => ({
                    title: (entry.title || "").trim(),
                    url: (entry.link || "").trim(),
                    source: source.name,
                    publishedAt: safeDate(entry.isoDate || entry.pubDate).toISOString(),
                }));
                console.log(`  ✓ ${source.name}: ${items.length} items`);
                return items;
            } catch (err) {
                console.warn(`  ✗ ${source.name}: ${err.message}`);
                return [];
            }
        })
    );

    // Flatten, sort newest-first, and limit
    const all = results.flat();
    all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return all.slice(0, 20);
}
