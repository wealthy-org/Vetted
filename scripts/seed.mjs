import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { categorizeToken } from "../lib/categorize.js";
import { computeRiskScore } from "../lib/risk.js";
import { computeAllStats } from "../lib/computeStats.js";
import { fetchTokenSecurity } from "../lib/goplus.js";
import { fetchTokenData } from "../lib/dexscreener.js";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const sql = neon(process.env.DATABASE_URL);

const kols = [
  { id: randomUUID(), username: "kol_alpha", name: "Alpha Caller" },
  { id: randomUUID(), username: "fadedcalls", name: "Faded Calls" },
  { id: randomUUID(), username: "cryptoray", name: "Crypto Ray" },
  { id: randomUUID(), username: "degentrader", name: "Degen Trader" },
  { id: randomUUID(), username: "moonhunter", name: "Moon Hunter" },
  { id: randomUUID(), username: "chainsignal", name: "Chain Signal" },
  { id: randomUUID(), username: "solanawhisperer", name: "Solana Whisperer" },
  { id: randomUUID(), username: "gemfinder", name: "Gem Finder" },
  { id: randomUUID(), username: "onchainowl", name: "Onchain Owl" },
  { id: randomUUID(), username: "basedtrader", name: "Based Trader" },
  { id: randomUUID(), username: "cryptonomad", name: "Crypto Nomad" },
  { id: randomUUID(), username: "alphaleaks", name: "Alpha Leaks" },
  { id: randomUUID(), username: "degencapital", name: "Degen Capital" },
  { id: randomUUID(), username: "satoshiscout", name: "Satoshi Scout" },
  { id: randomUUID(), username: "wagmicalls", name: "Wagmi Calls" },
  { id: randomUUID(), username: "rugradar", name: "Rug Radar" },
  { id: randomUUID(), username: "cieloeyes", name: "Cielo Eyes" },
  { id: randomUUID(), username: "insidertrades", name: "Insider Trades" },
  { id: randomUUID(), username: "memedetective", name: "Meme Detective" },
  { id: randomUUID(), username: "signalhunterx", name: "Signal Hunter X" },
  { id: randomUUID(), username: "quantape", name: "Quant Ape" },
  { id: randomUUID(), username: "orbitcalls", name: "Orbit Calls" },
  { id: randomUUID(), username: "nightowltrades", name: "Night Owl Trades" },
  { id: randomUUID(), username: "vaultkeeper", name: "Vault Keeper" },
  { id: randomUUID(), username: "pumpwatcher", name: "Pump Watcher" },
  { id: randomUUID(), username: "ledgerlogic", name: "Ledger Logic" },
  { id: randomUUID(), username: "swingtrader99", name: "Swing Trader 99" },
  { id: randomUUID(), username: "yieldnomad", name: "Yield Nomad" },
];

// `multiplier` simulates price movement since the call/buy: price_at_call
// (and price_at_tx for wallet buys) is always seeded as 1, and price_usd
// is 1 * multiplier — so compute-stats.mjs has real win/loss ratios to
// derive win_rate and avg_return from, instead of us hand-typing them.
//
// These are all REAL, currently-tracked tokens (verified against the
// Dexscreener API) so their logos actually resolve from the CDN instead
// of falling back to a plain letter badge — liquidity/holder figures below
// are real too; tax is assumed 0 for these (all long-established, non-tax
// tokens) since we don't re-fetch GoPlus data for seed purposes.
const tokens = [
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", chain: "solana", name: "Bonk", symbol: "BONK", liquidity: 276462, taxBuy: 0, taxSell: 0, holders: 800000, honeypot: false, multiplier: 1.4 },
  { address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", chain: "solana", name: "dogwifhat", symbol: "WIF", liquidity: 136813, taxBuy: 0, taxSell: 0, holders: 120000, honeypot: false, multiplier: 2.1 },
  { address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", chain: "bnb", name: "FLOKI", symbol: "FLOKI", liquidity: 8729217, taxBuy: 0, taxSell: 0, holders: 500000, honeypot: false, multiplier: 0.85 },
  { address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", chain: "ethereum", name: "Shiba Inu", symbol: "SHIB", liquidity: 275072, taxBuy: 0, taxSell: 0, holders: 1400000, honeypot: false, multiplier: 1.05 },
  { address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", chain: "solana", name: "Popcat", symbol: "POPCAT", liquidity: 3558551, taxBuy: 0, taxSell: 0, holders: 95000, honeypot: false, multiplier: 1.6 },
  { address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", chain: "ethereum", name: "Pepe", symbol: "PEPE", liquidity: 26231893, taxBuy: 0, taxSell: 0, holders: 300000, honeypot: false, multiplier: 0.72 },
  { address: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv", chain: "solana", name: "Pudgy Penguins", symbol: "PENGU", liquidity: 3324523, taxBuy: 0, taxSell: 0, holders: 180000, honeypot: false, multiplier: 1.9 },
  { address: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump", chain: "solana", name: "Goatseus Maximus", symbol: "GOAT", liquidity: 1413464, taxBuy: 0, taxSell: 0, holders: 60000, honeypot: false, multiplier: 3.2 },
  { address: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC", chain: "solana", name: "ai16z", symbol: "AI16Z", liquidity: 53408, taxBuy: 0, taxSell: 0, holders: 25000, honeypot: false, multiplier: 0.5 },
  { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", chain: "solana", name: "Jupiter", symbol: "JUP", liquidity: 467677, taxBuy: 0, taxSell: 0, holders: 700000, honeypot: false, multiplier: 1.15 },
  { address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", chain: "solana", name: "Raydium", symbol: "RAY", liquidity: 1601053, taxBuy: 0, taxSell: 0, holders: 150000, honeypot: false, multiplier: 1.3 },
  { address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", chain: "bnb", name: "PancakeSwap Token", symbol: "CAKE", liquidity: 1014405, taxBuy: 0, taxSell: 0, holders: 250000, honeypot: false, multiplier: 0.95 },
  { address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", chain: "solana", name: "Pyth Network", symbol: "PYTH", liquidity: 213085, taxBuy: 0, taxSell: 0, holders: 400000, honeypot: false, multiplier: 1.08 },
  { address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", chain: "solana", name: "Jito", symbol: "JTO", liquidity: 114182, taxBuy: 0, taxSell: 0, holders: 220000, honeypot: false, multiplier: 1.22 },
  { address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", chain: "solana", name: "Wen", symbol: "WEN", liquidity: 64887, taxBuy: 0, taxSell: 0, holders: 180000, honeypot: false, multiplier: 0.6 },
  { address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", chain: "solana", name: "Book of Meme", symbol: "BOME", liquidity: 15107770, taxBuy: 0, taxSell: 0, holders: 260000, honeypot: false, multiplier: 2.4 },
  { address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", chain: "solana", name: "cat in a dogs world", symbol: "MEW", liquidity: 8367418, taxBuy: 0, taxSell: 0, holders: 210000, honeypot: false, multiplier: 1.75 },
  { address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", chain: "solana", name: "Myro", symbol: "MYRO", liquidity: 121786, taxBuy: 0, taxSell: 0, holders: 90000, honeypot: false, multiplier: 0.45 },
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", chain: "solana", name: "Samoyedcoin", symbol: "SAMO", liquidity: 104755, taxBuy: 0, taxSell: 0, holders: 70000, honeypot: false, multiplier: 1.5 },
  { address: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E", chain: "ethereum", name: "FLOKI", symbol: "FLOKI", liquidity: 7182620, taxBuy: 0, taxSell: 0, holders: 480000, honeypot: false, multiplier: 1.1 },
  { address: "0x5026F006B85729a8b14553FAE6af249aD16c9aaB", chain: "ethereum", name: "Wojak", symbol: "WOJAK", liquidity: 857771, taxBuy: 0, taxSell: 0, holders: 40000, honeypot: false, multiplier: 0.68 },
  { address: "0xA35923162C49cF95e6BF26623385eb431ad920D3", chain: "ethereum", name: "Turbo", symbol: "TURBO", liquidity: 84545, taxBuy: 0, taxSell: 0, holders: 65000, honeypot: false, multiplier: 2.8 },
  { address: "0xc748673057861a797275CD8A068AbB95A902e8de", chain: "bnb", name: "Baby Doge Coin", symbol: "BABYDOGE", liquidity: 8679340, taxBuy: 0, taxSell: 0, holders: 1900000, honeypot: false, multiplier: 0.92 },
  { address: "So11111111111111111111111111111111111111112", chain: "solana", name: "Wrapped SOL", symbol: "SOL", liquidity: 24709154, taxBuy: 0, taxSell: 0, holders: 5000000, honeypot: false, multiplier: 1.3 },
  { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", chain: "solana", name: "USD Coin", symbol: "USDC", liquidity: 3644052, taxBuy: 0, taxSell: 0, holders: 3000000, honeypot: false, multiplier: 1.0 },
  { address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", chain: "solana", name: "Fartcoin", symbol: "FARTCOIN", liquidity: 7130230, taxBuy: 0, taxSell: 0, holders: 140000, honeypot: false, multiplier: 4.1 },
  { address: "A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump", chain: "solana", name: "FWOG", symbol: "FWOG", liquidity: 1408732, taxBuy: 0, taxSell: 0, holders: 55000, honeypot: false, multiplier: 1.55 },
  { address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", chain: "solana", name: "Orca", symbol: "ORCA", liquidity: 561251, taxBuy: 0, taxSell: 0, holders: 85000, honeypot: false, multiplier: 1.2 },
  { address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", chain: "solana", name: "Mango Markets", symbol: "MNGO", liquidity: 44053, taxBuy: 0, taxSell: 0, holders: 30000, honeypot: false, multiplier: 0.55 },
  { address: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", chain: "solana", name: "Kamino", symbol: "KMNO", liquidity: 1468739, taxBuy: 0, taxSell: 0, holders: 95000, honeypot: false, multiplier: 1.35 },
  { address: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ", chain: "solana", name: "Wormhole", symbol: "W", liquidity: 100354, taxBuy: 0, taxSell: 0, holders: 180000, honeypot: false, multiplier: 0.62 },
  { address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", chain: "solana", name: "Render", symbol: "RENDER", liquidity: 263254, taxBuy: 0, taxSell: 0, holders: 210000, honeypot: false, multiplier: 1.65 },
  { address: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", chain: "solana", name: "Helium", symbol: "HNT", liquidity: 378706, taxBuy: 0, taxSell: 0, holders: 150000, honeypot: false, multiplier: 1.1 },
  { address: "BZLbGTNCSFfoth2GYDtwr7e4imWzpR5jqcUuGEwr646K", chain: "solana", name: "io.net", symbol: "IO", liquidity: 64537, taxBuy: 0, taxSell: 0, holders: 60000, honeypot: false, multiplier: 0.48 },
  { address: "ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq", chain: "solana", name: "Zeus Network", symbol: "ZEUS", liquidity: 54304, taxBuy: 0, taxSell: 0, holders: 20000, honeypot: false, multiplier: 1.9 },
  { address: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", chain: "solana", name: "Slerf", symbol: "SLERF", liquidity: 16800110, taxBuy: 0, taxSell: 0, holders: 75000, honeypot: false, multiplier: 0.7 },
  { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", chain: "ethereum", name: "Aave", symbol: "AAVE", liquidity: 420497, taxBuy: 0, taxSell: 0, holders: 220000, honeypot: false, multiplier: 1.4 },
  { address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", chain: "ethereum", name: "Maker", symbol: "MKR", liquidity: 218271, taxBuy: 0, taxSell: 0, holders: 90000, honeypot: false, multiplier: 0.9 },
  { address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", chain: "ethereum", name: "Arbitrum", symbol: "ARB", liquidity: 32441, taxBuy: 0, taxSell: 0, holders: 400000, honeypot: false, multiplier: 0.8 },
  { address: "0x4200000000000000000000000000000000000042", chain: "ethereum", name: "Optimism", symbol: "OP", liquidity: 302986, taxBuy: 0, taxSell: 0, holders: 350000, honeypot: false, multiplier: 1.05 },
  { address: "0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6", chain: "ethereum", name: "Polygon Ecosystem Token", symbol: "POL", liquidity: 34049, taxBuy: 0, taxSell: 0, holders: 500000, honeypot: false, multiplier: 0.75 },
  { address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", chain: "ethereum", name: "The Graph", symbol: "GRT", liquidity: 132930, taxBuy: 0, taxSell: 0, holders: 280000, honeypot: false, multiplier: 1.15 },
  { address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942", chain: "ethereum", name: "Decentraland", symbol: "MANA", liquidity: 72730, taxBuy: 0, taxSell: 0, holders: 310000, honeypot: false, multiplier: 0.65 },
  { address: "0x4d224452801ACEd8B2F0aebE155379bb5D594381", chain: "ethereum", name: "ApeCoin", symbol: "APE", liquidity: 354461, taxBuy: 0, taxSell: 0, holders: 260000, honeypot: false, multiplier: 0.58 },
  { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", chain: "bnb", name: "Wrapped BNB", symbol: "WBNB", liquidity: 11733651, taxBuy: 0, taxSell: 0, holders: 800000, honeypot: false, multiplier: 1.25 },
  { address: "0x111111111117dC0aa78b770fA6A738034120C302", chain: "ethereum", name: "1inch", symbol: "1INCH", liquidity: 1594316, taxBuy: 0, taxSell: 0, holders: 190000, honeypot: false, multiplier: 1.0 },
  { address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", chain: "ethereum", name: "Sushi", symbol: "SUSHI", liquidity: 999671, taxBuy: 0, taxSell: 0, holders: 130000, honeypot: false, multiplier: 0.52 },
  { address: "0x514910771af9ca656af840dff83e8264ecf986ca", chain: "ethereum", name: "Chainlink", symbol: "LINK", liquidity: 335727, taxBuy: 0, taxSell: 0, holders: 650000, honeypot: false, multiplier: 1.3 },
  { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", chain: "ethereum", name: "Uniswap", symbol: "UNI", liquidity: 469846, taxBuy: 0, taxSell: 0, holders: 420000, honeypot: false, multiplier: 1.45 },
  { address: "0xD533a949740bb3306d119CC777fa900bA034cd52", chain: "ethereum", name: "Curve DAO Token", symbol: "CRV", liquidity: 1835869, taxBuy: 0, taxSell: 0, holders: 110000, honeypot: false, multiplier: 0.85 },
  { address: "0xc00e94Cb662C3520282E6f5717214004A7f26888", chain: "ethereum", name: "Compound", symbol: "COMP", liquidity: 139231, taxBuy: 0, taxSell: 0, holders: 95000, honeypot: false, multiplier: 1.1 },
  // taxBuy/taxSell/holders below are fallbacks only — real values (1.99%/1.9% tax) come from GoPlus at seed time, verified separately.
  { address: "0xA2b4C0Af19cC16a6CfAcCe81F192B024d625817D", chain: "ethereum", name: "Kishu Inu", symbol: "KISHU", liquidity: 959867, taxBuy: 2, taxSell: 2, holders: 281356, honeypot: false, multiplier: 0.35 },
  // Robinhood chain (GoPlus id 4663) — currently trending, lots of
  // copycat "Robinhood"-named tokens exploiting the hype. This one is a
  // real example of the risk this product is meant to catch: $757K
  // liquidity but only 11 real holders (verified via GoPlus).
  { address: "0x99A90B1218419c62A2Fa7E427284C6c7D058d47a", chain: "robinhood", name: "Robinhood", symbol: "ROBINHOOD", liquidity: 756991, taxBuy: 0, taxSell: 0, holders: 11, honeypot: false, multiplier: 0.15 },
];

const wallets = [
  { id: randomUUID(), address: "5Fj9wPq3RtY7mNbVcXzAsDfGhJkLpQwErTyUiOpAsWa", chain: "solana", label: "Whale #1" },
  { id: randomUUID(), address: "8mNbVcXzAsDfGhJkLpQwErTyUiOpAsDfGhJkLp5Fj9w", chain: "solana", label: "Whale #2" },
  { id: randomUUID(), address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", chain: "ethereum", label: "Whale #3" },
  { id: randomUUID(), address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", chain: "bnb", label: "Whale #4" },
  { id: randomUUID(), address: "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4fXVwoRB1nDA", chain: "solana", label: "Whale #5" },
  { id: randomUUID(), address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", chain: "solana", label: "Whale #6" },
  { id: randomUUID(), address: "0x28C6c06298d514Db089934071355E5743bf21d60", chain: "ethereum", label: "Whale #7" },
  { id: randomUUID(), address: "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", chain: "bnb", label: "Whale #8" },
];

async function main() {
  console.log(`Seeding ${kols.length} kols...`);
  for (const k of kols) {
    await sql`
      insert into kols (id, x_username, display_name)
      values (${k.id}, ${k.username}, ${k.name})
      on conflict (x_username) do nothing
    `;
    const rows = await sql`select id from kols where x_username = ${k.username}`;
    k.id = rows[0].id; // use the row that actually exists, in case of conflict
    // kol_stats itself is populated by scripts/compute-stats.mjs (run at
    // the end of this script) from real price_at_call vs price_usd data —
    // not hand-typed here.
  }

  console.log(`Seeding ${tokens.length} tokens (fetching real tax/holder data from GoPlus)...`);
  for (const t of tokens) {
    // Pull real buy/sell tax, honeypot flag, and holder count from GoPlus
    // instead of guessing — falls back to the hand-set defaults above only
    // if GoPlus is unreachable or rate-limits this address.
    let taxBuy = t.taxBuy;
    let taxSell = t.taxSell;
    let honeypot = t.honeypot;
    let holders = t.holders;
    try {
      const security = await fetchTokenSecurity(t.chain, t.address);
      if (security) {
        taxBuy = security.taxBuy;
        taxSell = security.taxSell;
        honeypot = security.isHoneypot;
        holders = security.holderCount ?? holders;
      }
    } catch {
      // keep the fallback values on network/rate-limit errors
    }

    // Real 24h volume from Dexscreener — independent of price_usd, which
    // stays a synthetic 1→multiplier ratio (see comment above) so the
    // win/loss simulation in computeStats.js keeps working.
    let volume24h = null;
    try {
      const dexData = await fetchTokenData(t.address);
      volume24h = dexData?.volume24h ?? null;
    } catch {
      // volume stays null if Dexscreener has no data for this address
    }

    const riskScore = computeRiskScore({
      liquidity: t.liquidity,
      taxBuy,
      taxSell,
      isHoneypot: honeypot,
      holderCount: holders,
    });
    const category = categorizeToken(t.name, t.symbol);
    const priceUsd = t.multiplier; // price_at_call/price_at_tx are seeded as 1, so price_usd == multiplier
    await sql`
      insert into tokens (address, chain, name, symbol, liquidity, tax_buy, tax_sell, holder_count, risk_score, is_honeypot, category, price_usd, volume_24h)
      values (${t.address}, ${t.chain}, ${t.name}, ${t.symbol}, ${t.liquidity}, ${taxBuy}, ${taxSell}, ${holders}, ${riskScore}, ${honeypot}, ${category}, ${priceUsd}, ${volume24h})
      on conflict (address) do update set
        liquidity = excluded.liquidity, tax_buy = excluded.tax_buy, tax_sell = excluded.tax_sell,
        holder_count = excluded.holder_count, risk_score = excluded.risk_score, category = excluded.category,
        price_usd = excluded.price_usd, volume_24h = excluded.volume_24h, last_updated = now()
    `;

    // Seed a believable price history (interpolated from the base price=1
    // at "first call" up to the current multiplier, with light noise) so
    // the sparkline on the token detail page has something to draw. Only
    // done once per token — real snapshots accumulate from here on via
    // lib/refreshPrices.js on the hourly cron.
    const existingSnapshots = await sql`
      select count(*)::int as n from price_snapshots where token_address = ${t.address}
    `;
    if (existingSnapshots[0].n === 0) {
      const points = 12;
      for (let p = 0; p < points; p++) {
        const progress = p / (points - 1); // 0 -> 1
        const noise = 1 + (Math.sin(p * 1.7 + t.address.length) * 0.04);
        const price = (1 + (t.multiplier - 1) * progress) * noise;
        const hoursAgo = (points - 1 - p) * 2; // spread across the last 24h (12 points, 2h apart)
        const snapshotAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
        await sql`
          insert into price_snapshots (token_address, price_usd, volume_24h, liquidity, snapshot_at)
          values (${t.address}, ${price}, ${volume24h}, ${t.liquidity}, ${snapshotAt})
        `;
      }
    }
  }

  console.log(`Seeding smart wallets...`);
  for (const w of wallets) {
    await sql`
      insert into smart_wallets (id, address, chain, label)
      values (${w.id}, ${w.address}, ${w.chain}, ${w.label})
      on conflict (address, chain) do nothing
    `;
    const rows = await sql`select id from smart_wallets where address = ${w.address} and chain = ${w.chain}`;
    w.id = rows[0].id;
  }

  // Generate calls: every token gets 2-3 calls from different KOLs, spread
  // out over the last ~2 weeks so the Feed's "called X ago" column has a
  // realistic spread instead of everything bunched in the last hour.
  console.log("Generating calls...");
  let callCount = 0;
  let minutesCursor = 2;
  for (let ti = 0; ti < tokens.length; ti++) {
    const token = tokens[ti];
    const callersForToken = 2 + (ti % 3); // 2, 3, or 4 KOLs per token
    for (let j = 0; j < callersForToken; j++) {
      const kol = kols[(ti * 5 + j * 7) % kols.length];
      const existing = await sql`
        select id from calls where kol_id = ${kol.id} and token_address = ${token.address} limit 1
      `;
      if (existing.length > 0) {
        await sql`update calls set price_at_call = 1 where id = ${existing[0].id} and price_at_call is null`;
        continue;
      }
      minutesCursor += 3 + (j * 11) + (ti % 7);
      const calledAt = new Date(Date.now() - minutesCursor * 60 * 1000).toISOString();
      await sql`
        insert into calls (kol_id, token_address, chain, tweet_url, called_at, price_at_call)
        values (${kol.id}, ${token.address}, ${token.chain}, ${"https://x.com/" + kol.username}, ${calledAt}, 1)
      `;
      callCount++;
    }
  }
  console.log(`  -> ${callCount} new call(s) inserted.`);

  // Generate wallet activity: every wallet buys/sells a handful of tokens.
  console.log("Generating wallet activity...");
  let activityCount = 0;
  let hoursCursor = 1;
  for (let wi = 0; wi < wallets.length; wi++) {
    const wallet = wallets[wi];
    const tradesForWallet = 3 + (wi % 3); // 3-5 trades per wallet
    for (let j = 0; j < tradesForWallet; j++) {
      const token = tokens[(wi * 4 + j * 9) % tokens.length];
      const action = j % 4 === 3 ? "sell" : "buy"; // mostly buys, occasional sell
      const existing = await sql`
        select id from wallet_activities
        where wallet_id = ${wallet.id} and token_address = ${token.address} and action = ${action}
        limit 1
      `;
      if (existing.length > 0) {
        await sql`update wallet_activities set price_at_tx = 1 where id = ${existing[0].id} and price_at_tx is null`;
        continue;
      }
      hoursCursor += 1 + (j * 3) + (wi % 5);
      const amount = 500 + ((wi * 37 + j * 113) % 25000);
      const txAt = new Date(Date.now() - hoursCursor * 60 * 60 * 1000).toISOString();
      await sql`
        insert into wallet_activities (wallet_id, token_address, action, amount, tx_at, price_at_tx)
        values (${wallet.id}, ${token.address}, ${action}, ${amount}, ${txAt}, 1)
      `;
      activityCount++;
    }
  }
  console.log(`  -> ${activityCount} new activity row(s) inserted.`);

  console.log("Seeding narratives...");
  const tagCounts = tokens.reduce((acc, t) => {
    const tag = categorizeToken(t.name, t.symbol);
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  for (const [tag, count] of Object.entries(tagCounts)) {
    await sql`
      insert into narratives (tag, token_count, total_volume, week_start)
      values (${tag}, ${count}, ${count * 45000}, ${weekStartStr})
      on conflict (tag, week_start) do update set token_count = excluded.token_count, total_volume = excluded.total_volume
    `;
  }

  console.log("Computing KOL & wallet win-rates from seeded price data...");
  const statsResult = await computeAllStats(sql);
  console.log(statsResult);

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
