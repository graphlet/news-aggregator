// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------
// Three-pass deduplication:
//   1. Exact URL match (normalised – lowercase, strip trailing slash)
//   2. Exact normalised-title match (lowercase, strip punctuation, collapse ws)
//   3. Fuzzy title similarity via word-level Jaccard (≥ 0.8 = duplicate)
//
// For each duplicate pair the *earlier-published* article is kept.
// ---------------------------------------------------------------------------

/**
 * Normalise a URL for comparison.
 * Lowercases and strips a trailing slash.
 */
function normaliseUrl(url) {
    try {
        const u = new URL(url);
        // Remove trailing slash from pathname
        u.pathname = u.pathname.replace(/\/+$/, "");
        return u.toString().toLowerCase();
    } catch {
        return (url || "").toLowerCase().replace(/\/+$/, "");
    }
}

/**
 * Normalise a title for exact-match comparison.
 * Lowercase, strip non-alphanumeric, collapse whitespace.
 */
function normaliseTitle(title) {
    return (title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Word-level Jaccard similarity between two strings.
 * Returns a number between 0 and 1.
 */
function jaccardSimilarity(a, b) {
    const setA = new Set(normaliseTitle(a).split(" ").filter(Boolean));
    const setB = new Set(normaliseTitle(b).split(" ").filter(Boolean));
    if (setA.size === 0 && setB.size === 0) return 1;
    let intersection = 0;
    for (const w of setA) {
        if (setB.has(w)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

/**
 * Deduplicate an array of normalised article items.
 * Items should already be sorted by publishedAt descending (newest first).
 * Earlier-published duplicates are dropped; the first occurrence wins.
 *
 * @param {Array<{title:string, url:string}>} items
 * @returns {Array} deduplicated items
 */
export function deduplicate(items) {
    const seenUrls = new Set();
    const seenTitles = new Set();
    const kept = [];

    for (const item of items) {
        // --- Pass 1: exact URL ---
        const normUrl = normaliseUrl(item.url);
        if (seenUrls.has(normUrl)) continue;

        // --- Pass 2: exact normalised title ---
        const normTitle = normaliseTitle(item.title);
        if (normTitle && seenTitles.has(normTitle)) continue;

        // --- Pass 3: fuzzy title similarity ---
        let isFuzzyDup = false;
        for (const prev of kept) {
            if (jaccardSimilarity(item.title, prev.title) >= 0.8) {
                isFuzzyDup = true;
                break;
            }
        }
        if (isFuzzyDup) continue;

        // Not a duplicate – keep it
        seenUrls.add(normUrl);
        if (normTitle) seenTitles.add(normTitle);
        kept.push(item);
    }

    return kept;
}
