// ---------------------------------------------------------------------------
// build-trends.js – Fetch market index data via Yahoo Finance chart API
// ---------------------------------------------------------------------------
// Returns an array of index objects with current price and performance metrics:
//   day change/%, 1-month %, 3-month %, year-to-date %
// ---------------------------------------------------------------------------

const INDEXES = [
    { symbol: "^GSPC", name: "S&P 500", region: "US", flag: "🇺🇸" },
    { symbol: "^DJI", name: "Dow Jones", region: "US", flag: "🇺🇸" },
    { symbol: "^IXIC", name: "Nasdaq", region: "US", flag: "🇺🇸" },
    { symbol: "^FTSE", name: "FTSE 100", region: "UK", flag: "🇬🇧" },
    { symbol: "^NSEI", name: "Nifty 50", region: "India", flag: "🇮🇳" },
    { symbol: "^BSESN", name: "Sensex", region: "India", flag: "🇮🇳" },
];

const DELAY_MS = 1500; // delay between requests to avoid 429s

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/** Find the close price nearest to (but not after) a target timestamp. */
function closestClose(timestamps, closes, targetTs) {
    let best = null;
    let bestTs = -Infinity;
    for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        if (t <= targetTs && closes[i] != null && t > bestTs) {
            best = closes[i];
            bestTs = t;
        }
    }
    return best;
}

/** Compute percentage change from an old price to the current price. */
function pctChange(current, previous) {
    if (previous == null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

/**
 * Fetch chart data for a single symbol from Yahoo Finance.
 * Uses a 1-year range with daily interval.
 */
async function fetchChart(symbol) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false`;

    // Retry with backoff on 429
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url);
        if (res.status === 429) {
            const wait = DELAY_MS * (attempt + 2);
            console.log(`    ⏳ Rate-limited, retrying in ${wait}ms…`);
            await sleep(wait);
            continue;
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        const result = json.chart?.result?.[0];
        if (!result) throw new Error("No chart data returned");
        return result;
    }
    throw new Error("Rate-limited after 3 retries");
}

/**
 * Fetch trend data for all configured indexes.
 * Returns an array of objects ready to be embedded in news.json.
 */
export async function fetchTrends() {
    const now = new Date();
    const year = now.getFullYear();

    // Target timestamps (seconds) for historical lookups
    const ytdTs = Math.floor(new Date(year, 0, 1).getTime() / 1000);
    const m3Ts = Math.floor(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime() / 1000);
    const m1Ts = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime() / 1000);

    const results = [];

    for (const idx of INDEXES) {
        try {
            const chart = await fetchChart(idx.symbol);
            const meta = chart.meta;
            const timestamps = chart.timestamp || [];
            const closes = chart.indicators?.quote?.[0]?.close || [];

            const price = meta.regularMarketPrice;

            // Previous close = last non-null close in history (yesterday's close)
            let prevClose = null;
            for (let i = closes.length - 1; i >= 0; i--) {
                if (closes[i] != null) { prevClose = closes[i]; break; }
            }
            const dayChange = prevClose != null ? price - prevClose : null;
            const dayChangePct = prevClose != null && prevClose !== 0
                ? ((price - prevClose) / prevClose) * 100
                : null;

            const ytdClose = closestClose(timestamps, closes, ytdTs);
            const m3Close = closestClose(timestamps, closes, m3Ts);
            const m1Close = closestClose(timestamps, closes, m1Ts);

            results.push({
                symbol: idx.symbol,
                name: idx.name,
                region: idx.region,
                flag: idx.flag,
                price,
                dayChange,
                dayChangePct,
                month1Pct: pctChange(price, m1Close),
                month3Pct: pctChange(price, m3Close),
                ytdPct: pctChange(price, ytdClose),
                updatedAt: new Date().toISOString(),
            });

            console.log(`  ✓ ${idx.name} (${idx.symbol}): ${price}`);
        } catch (err) {
            console.warn(`  ✗ ${idx.name} (${idx.symbol}): ${err.message}`);
        }

        // Rate-limit between requests
        if (INDEXES.indexOf(idx) < INDEXES.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    return results;
}
