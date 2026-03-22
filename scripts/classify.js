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
    // Dev tools & platforms
    "api",
    "sdk",
    "cli",
    "open source",
    "open-source",
    "github",
    "developer",
    "devtool",
    "framework",
    "library",
    "plugin",
    "extension",
    "integration",
    "vscode",
    "copilot",
    "cursor",
    "windsurf",
    "replit",
    // Programming & code
    "code",
    "programming",
    "tutorial",
    "coding",
    "debug",
    "deploy",
    "workflow",
    // Models & releases
    "new model",
    "model release",
    "model weights",
    "open weight",
    "llama",
    "mistral",
    "phi-",
    "gemma",
    "qwen",
    "claude",
    "gpt-4",
    "gpt-5",
    "o1",
    "o3",
    "deepseek",
    "command r",
    // Capabilities & techniques
    "fine-tune",
    "fine-tuning",
    "finetuning",
    "function calling",
    "tool use",
    "agentic",
    "agent framework",
    "multi-agent",
    "prompt engineering",
    "rag",
    "retrieval augmented",
    "vector database",
    "embedding",
    "context window",
    "multimodal",
    "vision model",
    "code generation",
    "code interpreter",
    // ML frameworks & infra
    "langchain",
    "langgraph",
    "llamaindex",
    "semantic kernel",
    "autogen",
    "crewai",
    "hugging face",
    "huggingface",
    "pytorch",
    "tensorflow",
    "ollama",
    "vllm",
    "mlx",
    "gguf",
    "onnx",
    "transformer",
    // Benchmarks & evals
    "benchmark",
    "eval",
    "leaderboard",
    "mmlu",
    "humaneval",
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
