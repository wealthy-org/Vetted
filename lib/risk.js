// Rule-based risk score, 0-100. Higher = safer.
// Combines liquidity depth, tax rates, and honeypot/holder signals from
// lib/dexscreener.js + lib/goplus.js output.

export function computeRiskScore({ liquidity, taxBuy, taxSell, isHoneypot, holderCount }) {
  if (isHoneypot) return 0;

  let score = 100;

  if (liquidity == null) score -= 20;
  else if (liquidity < 5000) score -= 40;
  else if (liquidity < 20000) score -= 20;
  else if (liquidity < 50000) score -= 8;

  const totalTax = (taxBuy ?? 0) + (taxSell ?? 0);
  if (totalTax > 20) score -= 35;
  else if (totalTax > 10) score -= 20;
  else if (totalTax > 5) score -= 8;

  if (holderCount == null) score -= 10;
  else if (holderCount < 50) score -= 20;
  else if (holderCount < 200) score -= 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}
