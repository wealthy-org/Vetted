"use client";

import { useState } from "react";
import Link from "next/link";
import TokenIcon from "../TokenIcon";

const TAG_ICONS = {
  "dog coins": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10c0-3 2-6 5-6 1 0 2 .5 2.5 1.5C12 4.5 13 4 14 4c3 0 5 3 5 6-1 0-2 1-2 3v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5c0-2-1-3-2-3z" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  meme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="14" rx="8" ry="6" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="3" strokeLinejoin="round" />
      <circle cx="17" cy="7" r="3" strokeLinejoin="round" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  "ai agent": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="8" width="14" height="11" rx="2" strokeLinejoin="round" />
      <path d="M12 8V4M9 4h6" strokeLinecap="round" />
      <circle cx="9.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  utility: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6.3 6.3a1.5 1.5 0 0 0 2.1 2.1l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2-2 2.1-2.1z" strokeLinejoin="round" />
    </svg>
  ),
  uncategorized: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M7 15l4-5 3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function fmtUsd(n) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString("en-US")}`;
}

export default function NarrativeGrid({ rows }) {
  const [openTag, setOpenTag] = useState(null);
  const max = Math.max(1, ...rows.map((r) => Number(r.token_count)));

  return (
    <div className="nlist">
      {rows.map((r, i) => {
        const isOpen = openTag === r.tag;
        return (
          <div className={`nlist-item ${isOpen ? "nlist-item--open" : ""}`} key={r.tag}>
            <button
              type="button"
              className="nlist-row"
              onClick={() => setOpenTag(isOpen ? null : r.tag)}
            >
              <span className="nlist-rank">{i + 1}</span>
              <span className="nlist-icon">{TAG_ICONS[r.tag] ?? TAG_ICONS.uncategorized}</span>

              <span className="nlist-name">
                <b style={{ textTransform: "capitalize" }}>{r.tag}</b>
                <span className="dp__muted" style={{ fontSize: 12 }}>
                  {fmtUsd(r.total_volume)} volume · week of {new Date(r.week_start).toLocaleDateString()}
                </span>
              </span>

              <span className="nlist-bar" title={`${r.token_count} of ${max} tokens in the largest category`}>
                <span
                  className="nlist-bar__fill"
                  style={{ width: `${(Number(r.token_count) / max) * 100}%` }}
                />
              </span>

              <span className="nlist-count">
                {r.token_count} {r.token_count === 1 ? "token" : "tokens"}
              </span>

              <svg
                className={`nlist-chevron ${isOpen ? "open" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isOpen && r.tokens.length > 0 && (
              <div className="nlist-tokens">
                {r.tokens.map((t) => (
                  <Link
                    key={t.address}
                    href={`/dashboard/token/${t.address}`}
                    className="nlist-token"
                  >
                    <TokenIcon chain={t.chain} address={t.address} symbol={t.symbol} size={24} />
                    <span className="nlist-token__info">
                      <span className="dp__token">${t.symbol}</span>
                      <span className="dp__chain">{t.chain}</span>
                    </span>
                    <span className="dp__muted" style={{ fontSize: 12.5 }}>
                      {fmtUsd(t.liquidity)}
                    </span>
                    <span className={`pill ${t.risk_score >= 50 ? "pill--ok" : "pill--warn"}`}>
                      {t.risk_score}/100
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
