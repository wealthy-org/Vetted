const CHAIN_LABELS = {
  solana: "Solana",
  ethereum: "Ethereum",
  bnb: "BNB Chain",
  bsc: "BNB Chain",
  optimism: "Optimism",
  robinhood: "Robinhood",
};

export function chainLabel(chain) {
  return CHAIN_LABELS[chain] ?? chain;
}
