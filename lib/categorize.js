// Keyword-based auto-categorization for narrative tracking.
// Runs against a token's name + symbol whenever a token is first seen
// (cron scraper, seed script) — no manual tagging required.

const RULES = [
  { tag: "dog coins", keywords: ["dog", "inu", "shib", "floki", "corgi", "puppy", "bonk"] },
  { tag: "ai agent", keywords: ["ai", "agent", "gpt", "bot", "auto", "neural"] },
  { tag: "meme", keywords: ["pepe", "frog", "meme", "wojak", "chad", "moon", "safe", "cat", "penguin"] },
  { tag: "utility", keywords: ["finance", "protocol", "hub", "swap", "vault", "utility"] },
];

export function categorizeToken(name, symbol) {
  const text = `${name ?? ""} ${symbol ?? ""}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.tag;
    }
  }

  return "uncategorized";
}
