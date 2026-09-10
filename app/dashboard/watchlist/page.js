"use client";

import { useEffect, useState } from "react";
import { useAppUser } from "../UserContext";
import TokenIcon from "../TokenIcon";

export default function WatchlistPage() {
  const { userId } = useAppUser();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/watchlist?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []));
  }, [userId]);

  async function removeItem(tokenAddress) {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, tokenAddress }),
    });
    setItems((prev) => prev.filter((i) => i.address !== tokenAddress));
  }

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>Watchlist</h1>
        <p>Tokens you&apos;re tracking, saved from the live feed.</p>
      </div>

      {!userId ? (
        <div className="dp__empty">
          <p>Setting up your account…</p>
          <span>This finishes automatically right after your wallet connects.</span>
        </div>
      ) : items === null ? (
        <div className="dp__empty">
          <p>Loading…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="dp__empty">
          <p>Your watchlist is empty.</p>
          <span>
            Hit <code>+ Watchlist</code> on any call in the live feed to save
            it here.
          </span>
        </div>
      ) : (
        <div className="dp__table">
          <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1fr 0.8fr 1fr 1fr 0.8fr" }}>
            <span>Token</span>
            <span>Chain</span>
            <span>Risk score</span>
            <span>Liquidity</span>
            <span></span>
          </div>
          {items.map((item) => (
            <div
              className="dp__row"
              key={item.address}
              style={{ gridTemplateColumns: "1fr 0.8fr 1fr 1fr 0.8fr" }}
            >
              <span className="dp__entity">
                <TokenIcon chain={item.chain} address={item.address} symbol={item.symbol} />
                <span className="dp__token">${item.symbol}</span>
              </span>
              <span className="dp__muted">{item.chain}</span>
              <span>
                <span className={`pill ${item.risk_score >= 50 ? "pill--ok" : "pill--warn"}`}>
                  {item.risk_score}/100
                </span>
              </span>
              <span>
                {item.liquidity != null ? `$${Number(item.liquidity).toLocaleString()}` : "—"}
              </span>
              <span>
                <button className="dp__add" onClick={() => removeItem(item.address)}>
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
