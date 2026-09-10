"use client";

import { useState } from "react";

// Dexscreener's CDN hosts token logos at a predictable path per chain+address.
// Real tokens usually have one; our demo/seed addresses won't, so we fall
// back to a colored letter badge if the image 404s.
function cdnUrl(chain, address) {
  return `https://dd.dexscreener.com/ds-data/tokens/${chain}/${address}.png`;
}

export default function TokenIcon({ chain, address, symbol, size = 26 }) {
  const [failed, setFailed] = useState(false);

  if (failed || !chain || !address) {
    return (
      <span
        className="dp__coin"
        style={{ width: size, height: size, fontSize: size * 0.46 }}
      >
        {symbol?.[0] ?? "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cdnUrl(chain, address)}
      alt={symbol}
      width={size}
      height={size}
      className="token-icon"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
