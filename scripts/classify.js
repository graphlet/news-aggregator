// ---------------------------------------------------------------------------
// Keyword-Based Classification
// ---------------------------------------------------------------------------
// Given an article item and its source's default category, return a category.
//
// AI categories:      "developers" | "everyone" | "advancements"
// Finance categories: "markets" | "crypto"
//
// Rules are checked top-to-bottom. First match wins.
// If nothing matches, the source's defaultCategory is used.
//
// To tweak classification: edit the keyword arrays below.
// ---------------------------------------------------------------------------

// --- AI Keywords ---

const DEVELOPER_KEYWORDS = [
    "api",
    "sdk",
    "open source",
    "open-source",
    "github",
    "developer",
    "framework",
    "library",
    "tutorial",
    "code",
    "programming",
    "langchain",
    "llm framework",
    "fine-tune",
    "fine-tuning",
    "finetuning",
    "benchmark",
    "model weights",
    "hugging face",
    "huggingface",
    "pytorch",
    "tensorflow",
    "llama",
    "mistral",
    "ollama",
    "vscode",
    "copilot",
    "prompt engineering",
    "rag",
    "vector database",
    "embedding",
];

const ADVANCEMENT_KEYWORDS = [
    "research",
    "paper",
    "breakthrough",
    "chip",
    "semiconductor",
    "infrastructure",
    "compute",
    "supercomputer",
    "regulation",
    "policy",
    "safety",
    "alignment",
    "agi",
    "funding",
    "acquisition",
    "billion",
    "trillion",
    "robotics",
    "autonomous",
    "quantum",
    "neural",
    "arxiv",
    "deepmind",
    "anthropic",
];

const EVERYONE_KEYWORDS = [
    "chatgpt",
    "gemini",
    "consumer",
    "app",
    "phone",
    "feature",
    "launch",
    "update",
    "available",
    "free",
    "subscription",
    "siri",
    "alexa",
    "assistant",
    "image generation",
    "dall-e",
    "midjourney",
    "stable diffusion",
    "ai tool",
];

// --- Finance Keywords ---

const MARKETS_KEYWORDS = [
    "stock",
    "shares",
    "equity",
    "market",
    "nasdaq",
    "s&p",
    "dow jones",
    "ftse",
    "nifty",
    "sensex",
    "bse",
    "nse",
    "earnings",
    "ipo",
    "trading",
    "wall street",
    "fed ",
    "federal reserve",
    "rbi",
    "bank of england",
    "interest rate",
    "inflation",
    "gdp",
    "index",
    "rally",
    "crash",
    "bull",
    "bear",
    "fiscal",
    "dividend",
    "bond",
    "treasury",
    "recession",
    "stimulus",
    "tariff",
];

const CRYPTO_KEYWORDS = [
    "bitcoin",
    "ethereum",
    "crypto",
    "blockchain",
    "defi",
    "nft",
    "web3",
    "token",
    "mining",
    "wallet",
    "binance",
    "coinbase",
    "solana",
    "ripple",
    "stablecoin",
    "altcoin",
    "btc",
    "eth",
    "halving",
    "ledger",
];

/**
 * Classify an AI article into a category.
 * @param {{ title: string }} item  – the normalised article
 * @param {string} defaultCategory  – the source-level fallback
 * @returns {"developers"|"everyone"|"advancements"}
 */
export function classify(item, defaultCategory) {
    const text = (item.title || "").toLowerCase();

    if (DEVELOPER_KEYWORDS.some((kw) => text.includes(kw))) return "developers";
    if (ADVANCEMENT_KEYWORDS.some((kw) => text.includes(kw))) return "advancements";
    if (EVERYONE_KEYWORDS.some((kw) => text.includes(kw))) return "everyone";

    return defaultCategory;
}

/**
 * Classify a finance article into a category.
 * @param {{ title: string }} item  – the normalised article
 * @param {string} defaultCategory  – the source-level fallback
 * @returns {"markets"|"crypto"}
 */
export function classifyFinance(item, defaultCategory) {
    const text = (item.title || "").toLowerCase();

    if (CRYPTO_KEYWORDS.some((kw) => text.includes(kw))) return "crypto";
    if (MARKETS_KEYWORDS.some((kw) => text.includes(kw))) return "markets";

    return defaultCategory;
}
