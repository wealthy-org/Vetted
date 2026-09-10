// Maps a chain to its public block explorer so addresses can link out to
// real on-chain data instead of being dead text.
const EXPLORERS = {
  solana: { name: "Solscan", url: (a) => `https://solscan.io/token/${a}` },
  ethereum: { name: "Etherscan", url: (a) => `https://etherscan.io/token/${a}` },
  bnb: { name: "BscScan", url: (a) => `https://bscscan.com/token/${a}` },
  bsc: { name: "BscScan", url: (a) => `https://bscscan.com/token/${a}` },
  optimism: { name: "Optimistic Etherscan", url: (a) => `https://optimistic.etherscan.io/token/${a}` },
};

export function explorerFor(chain, address) {
  const entry = EXPLORERS[chain];
  if (!entry) return null;
  return { name: entry.name, url: entry.url(address) };
}
