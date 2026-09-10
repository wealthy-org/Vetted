// Fetches recent tweets for a username via a public RSSHub instance.
// RSSHub converts an X profile into RSS — no official API key needed, but
// public instances can be unstable or rate-limited by X at any time.

const RSSHUB_BASE = process.env.RSSHUB_BASE || "https://rsshub.app";

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) return null;
  return match[1]
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

export async function fetchRecentTweets(username, limit = 5) {
  const url = `${RSSHUB_BASE}/twitter/user/${username}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VettedBot/1.0)" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`RSSHub returned ${res.status} for @${username}`);
  }

  const xml = await res.text();
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  return items.slice(0, limit).map((block) => ({
    title: extractTag(block, "title"),
    description: extractTag(block, "description"),
    link: extractTag(block, "link"),
    pubDate: extractTag(block, "pubDate"),
  }));
}
