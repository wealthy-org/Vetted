// Pulls a contract address out of tweet text and guesses the chain.

const SOLANA_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const EVM_RE = /\b0x[a-fA-F0-9]{40}\b/g;

export function extractContractAddress(text) {
  if (!text) return null;

  const evmMatch = text.match(EVM_RE);
  if (evmMatch) return { address: evmMatch[0], chain: "ethereum" };

  const solMatches = text.match(SOLANA_RE);
  if (solMatches) {
    // filter out common non-address base58-looking words / URLs slugs
    const candidate = solMatches.find((m) => !/^https?/i.test(m));
    if (candidate) return { address: candidate, chain: "solana" };
  }

  return null;
}
