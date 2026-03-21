// ---------------------------------------------------------------------------
// Source Configuration
// ---------------------------------------------------------------------------
// Each source has:
//   name            – display name shown in the dashboard
//   url             – RSS feed URL
//   defaultCategory – fallback category when keyword rules don't match
//
// Categories: "developers" | "everyone" | "advancements"
//
// To add a source: append an object to this array.
// To remove one: delete or comment out the entry.
// ---------------------------------------------------------------------------

const sources = [
  {
    name: "Hacker News – AI",
    url: "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT&count=30",
    defaultCategory: "developers",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    defaultCategory: "everyone",
  },
  {
    name: "The Verge – AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    defaultCategory: "everyone",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    defaultCategory: "advancements",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    defaultCategory: "advancements",
  },
];

export default sources;
