// Auto-categorization for narrative tracking.
//
// Known real tokens (the ones in scripts/seed.mjs) are mapped explicitly
// below — that's the accurate sector each project actually operates in
// (DEX, oracle, DePIN, etc.), not a guess. SYMBOL_OVERRIDES is checked
// first; anything not in it (e.g. a token discovered later by the live
// scraper) falls back to keyword matching against its name/symbol as a
// best-effort default, and anything that matches nothing stays
// "uncategorized" rather than being forced into a wrong bucket.

const SYMBOL_OVERRIDES = {
  // dog coins
  BONK: "dog coins",
  WIF: "dog coins",
  FLOKI: "dog coins",
  SHIB: "dog coins",
  BABYDOGE: "dog coins",
  KISHU: "dog coins",
  MYRO: "dog coins",
  SAMO: "dog coins",

  // cat coins
  POPCAT: "cat coins",
  MEW: "cat coins",

  // frog coins
  PEPE: "frog coins",
  FWOG: "frog coins",
  TURBO: "frog coins", // Turbo Toad — AI-generated meme, toad mascot

  // general/absurdist meme (no single animal mascot driving the bit)
  WOJAK: "meme",
  FARTCOIN: "meme",
  WEN: "meme",
  BOME: "meme",
  SLERF: "meme",
  GOAT: "meme",

  // AI agent
  AI16Z: "ai agent",

  // DEX & AMM
  RAY: "dex & amm",
  CAKE: "dex & amm",
  ORCA: "dex & amm",
  UNI: "dex & amm",
  SUSHI: "dex & amm",
  CRV: "dex & amm",

  // DEX aggregators (route across other DEXs, distinct from being one)
  JUP: "dex aggregator",
  "1INCH": "dex aggregator",

  // Oracle & data
  PYTH: "oracle & data",
  LINK: "oracle & data",
  GRT: "oracle & data",

  // Liquid staking
  JTO: "liquid staking",

  // Cross-chain & bridges
  W: "cross-chain & bridges",
  ZEUS: "cross-chain & bridges",

  // DePIN (decentralized physical infrastructure)
  RENDER: "depin",
  HNT: "depin",
  IO: "depin",

  // Lending & money markets
  AAVE: "lending & money markets",
  COMP: "lending & money markets",
  MKR: "lending & money markets",

  // Yield & leverage (Solana-native lend/leverage platforms)
  KMNO: "yield & leverage",
  MNGO: "yield & leverage",

  // Layer 2 rollups
  ARB: "layer 2 rollups",
  OP: "layer 2 rollups",

  // Scaling & sidechains
  POL: "scaling & sidechains",

  // Metaverse
  MANA: "metaverse",

  // Gaming & culture (NFT-collection-driven ecosystem token)
  APE: "gaming & culture",

  // NFT ecosystem
  PENGU: "nft ecosystem",

  // Wrapped & blue chip
  SOL: "wrapped & blue chip",
  WBNB: "wrapped & blue chip",

  // Stablecoin
  USDC: "stablecoin",
};

const RULES = [
  { tag: "dog coins", keywords: ["dog", "inu", "shib", "floki", "corgi", "puppy"] },
  { tag: "cat coins", keywords: ["cat", "kitty", "meow"] },
  { tag: "frog coins", keywords: ["frog", "pepe", "toad"] },
  { tag: "ai agent", keywords: ["ai", "agent", "gpt", "neural"] },
  { tag: "oracle & data", keywords: ["oracle", "chainlink"] },
  { tag: "depin", keywords: ["depin", "network", "render", "helium"] },
  { tag: "layer 2 rollups", keywords: ["rollup", "layer 2", "layer2"] },
  { tag: "dex & amm", keywords: ["swap", "dex", "exchange"] },
  { tag: "lending & money markets", keywords: ["lend", "finance", "vault", "protocol"] },
  { tag: "meme", keywords: ["meme", "wojak", "chad", "moon", "safe"] },
];

export function categorizeToken(name, symbol) {
  const symbolKey = symbol?.toUpperCase();
  if (symbolKey && SYMBOL_OVERRIDES[symbolKey]) {
    return SYMBOL_OVERRIDES[symbolKey];
  }

  const text = `${name ?? ""} ${symbol ?? ""}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.tag;
    }
  }

  return "uncategorized";
}
