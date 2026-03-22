// ---------------------------------------------------------------------------
// Keyword-Based Classification
// ---------------------------------------------------------------------------
// Given an article item and its source's default category, return one of:
//   "developers" | "everyone" | "advancements"
//
// Rules are checked top-to-bottom. First match wins.
// If nothing matches, the source's defaultCategory is used.
//
// To tweak classification: edit the keyword arrays below.
// ---------------------------------------------------------------------------

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

/**
 * Classify an article into a category.
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
