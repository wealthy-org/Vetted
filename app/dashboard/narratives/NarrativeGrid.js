"use client";

import { useState } from "react";
import Link from "next/link";
import TokenIcon from "../TokenIcon";
import { chainLabel } from "@/lib/chains";

const TAG_ICONS = {
  "dog coins": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10c0-3 2-6 5-6 1 0 2 .5 2.5 1.5C12 4.5 13 4 14 4c3 0 5 3 5 6-1 0-2 1-2 3v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5c0-2-1-3-2-3z" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  "cat coins": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 10 4 4l4 3h8l4-3-1 6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M5 10a7 7 0 0 0 14 0v2a7 7 0 0 1-14 0z" strokeLinejoin="round" />
      <circle cx="9.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  "frog coins": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="14" rx="7" ry="5" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2.4" strokeLinejoin="round" />
      <circle cx="16" cy="8" r="2.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="0.6" fill="currentColor" stroke="none" />
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
  "dex & amm": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h13M13 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7M11 20l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "dex aggregator": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 4h18l-7 8v6l-4 2v-8z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  "oracle & data": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  "liquid staking": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" strokeLinejoin="round" />
    </svg>
  ),
  "cross-chain & bridges": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4M3 17h18M6 17v3M18 17v3M10 17v3M14 17v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  depin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  "lending & money markets": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "yield & leverage": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l6-6 4 4 8-8M21 7h-6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "layer 2 rollups": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 3 8l9 5 9-5-9-5z" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "scaling & sidechains": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M9.5 9.5l5 5" strokeLinecap="round" />
    </svg>
  ),
  metaverse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" strokeLinejoin="round" />
      <path d="M12 3v18M4 7.5l8 4.5 8-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "gaming & culture": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="8" width="20" height="9" rx="4" strokeLinejoin="round" />
      <path d="M7 10.5v4M5 12.5h4" strokeLinecap="round" />
      <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  "nft ecosystem": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "wrapped & blue chip": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="7" width="16" height="13" rx="2" strokeLinejoin="round" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeLinecap="round" />
    </svg>
  ),
  stablecoin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c0-1.4-1.3-2-3-2s-3 .7-3 2 1.3 2 3 2 3 .6 3 2-1.3 2-3 2-3-.6-3-2" strokeLinecap="round" strokeLinejoin="round" />
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

// Top 3 by volume this week, excluding "uncategorized" (it's a fallback
// bucket, not a real narrative/meta — tagging it "Hot" would be
// misleading even though it currently has the most volume). This is a
// same-week ranking, not week-over-week growth: we only have one week
// of narratives snapshots right now, so a genuine "Trending" badge
// (requires comparing against last week) isn't honestly computable yet.
function getHotTags(rows) {
  return rows
    .filter((r) => r.tag !== "uncategorized")
    .slice()
    .sort((a, b) => Number(b.total_volume) - Number(a.total_volume))
    .slice(0, 3)
    .map((r) => r.tag);
}

export default function NarrativeGrid({ rows }) {
  const [openTag, setOpenTag] = useState(null);
  const hotTags = getHotTags(rows);

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
                <b style={{ textTransform: "capitalize" }}>
                  {r.tag}
                  {hotTags.includes(r.tag) && (
                    <span className="nlist-badge" title="Highest volume this week">
                      Hot
                    </span>
                  )}
                </b>
                <span className="dp__muted" style={{ fontSize: 12 }}>
                  {fmtUsd(r.total_volume)} volume · week of {new Date(r.week_start).toLocaleDateString()}
                </span>
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
                      <span className="nlist-token__chain">{chainLabel(t.chain)}</span>
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
