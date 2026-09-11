// GoPlus Security public API — no key required for reasonable rate limits.
// Docs: https://docs.gopluslabs.io/reference/token-security-api

const CHAIN_IDS = {
  ethereum: "1",
  bnb: "56",
  bsc: "56",
  optimism: "10",
  robinhood: "4663",
  solana: "solana",
};

export async function fetchTokenSecurity(chain, address) {
  const chainId = CHAIN_IDS[chain] ?? chain;
  const base =
    chainId === "solana"
      ? `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${address}`
      : `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`;

  const res = await fetch(base, { next: { revalidate: 30 } });
  if (!res.ok) return null;

  const data = await res.json();
  const info = data?.result?.[address.toLowerCase()] ?? data?.result?.[address];
  if (!info) return null;

  return {
    taxBuy: info.buy_tax ? Number(info.buy_tax) * 100 : 0,
    taxSell: info.sell_tax ? Number(info.sell_tax) * 100 : 0,
    isHoneypot: info.is_honeypot === "1",
    holderCount: info.holder_count ? Number(info.holder_count) : null,
    isOpenSource: info.is_open_source === "1",
  };
}
