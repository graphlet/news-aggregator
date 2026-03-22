// ---------------------------------------------------------------------------
// Source Configuration
// ---------------------------------------------------------------------------
// Each source has:
//   name            – display name shown in the dashboard
//   url             – RSS feed URL
//   domain          – top-level tab: "ai" | "finance"
//   defaultCategory – fallback category when keyword rules don't match
//
// AI categories:      "developers" | "everyone" | "advancements"
// Finance categories: "markets" | "crypto"
//
// To add a source: append an object to this array.
// To remove one: delete or comment out the entry.
// ---------------------------------------------------------------------------

const sources = [
    // -----------------------------------------------------------------------
    // AI Sources
    // -----------------------------------------------------------------------
    {
        name: "Hacker News – AI",
        url: "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT&count=30",
        domain: "ai",
        defaultCategory: "developers",
    },
    {
        name: "MIT Technology Review",
        url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        domain: "ai",
        defaultCategory: "everyone",
    },
    {
        name: "The Verge – AI",
        url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        domain: "ai",
        defaultCategory: "everyone",
    },
    {
        name: "OpenAI Blog",
        url: "https://openai.com/blog/rss.xml",
        domain: "ai",
        defaultCategory: "advancements",
    },
    {
        name: "Google AI Blog",
        url: "https://blog.google/technology/ai/rss/",
        domain: "ai",
        defaultCategory: "advancements",
    },

    // -----------------------------------------------------------------------
    // Finance Sources – Markets (US, UK, India)
    // -----------------------------------------------------------------------
    {
        name: "Yahoo Finance",
        url: "https://finance.yahoo.com/news/rssindex",
        domain: "finance",
        defaultCategory: "markets",
    },
    {
        name: "CNBC",
        url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        domain: "finance",
        defaultCategory: "markets",
    },
    {
        name: "BBC Business",
        url: "http://feeds.bbci.co.uk/news/business/rss.xml",
        domain: "finance",
        defaultCategory: "markets",
    },
    {
        name: "Economic Times – Markets",
        url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        domain: "finance",
        defaultCategory: "markets",
    },
    {
        name: "Moneycontrol",
        url: "https://www.moneycontrol.com/rss/latestnews.xml",
        domain: "finance",
        defaultCategory: "markets",
    },

    // -----------------------------------------------------------------------
    // Finance Sources – Crypto
    // -----------------------------------------------------------------------
    {
        name: "CoinDesk",
        url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        domain: "finance",
        defaultCategory: "crypto",
    },
    {
        name: "CoinTelegraph",
        url: "https://cointelegraph.com/rss",
        domain: "finance",
        defaultCategory: "crypto",
    },
];

export default sources;
