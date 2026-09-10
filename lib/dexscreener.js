// Dexscreener public API — no key required.
// Docs: https://docs.dexscreener.com/api/reference

export async function fetchTokenData(address) {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const pair = data?.pairs?.[0];
  if (!pair) return null;

  return {
    name: pair.baseToken?.name ?? null,
    symbol: pair.baseToken?.symbol ?? null,
    chain: pair.chainId ?? null,
    liquidity: pair.liquidity?.usd ?? null,
    marketCap: pair.fdv ?? null,
    priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
    volume24h: pair.volume?.h24 ?? null,
  };
}
