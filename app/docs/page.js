import CopyButton from "../dashboard/CopyButton";

export const metadata = {
  title: "API Docs — Vetted",
};

const BASE_URL = "http://getvetted.xyz/";

const ENDPOINTS = [
  {
    id: "token-score",
    method: "GET",
    path: "/api/v1/tokens/:address/score",
    title: "Token risk score",
    desc: "Returns the current risk score and on-chain data for a token.",
    curl: `curl "${BASE_URL}/api/v1/tokens/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/score"`,
    response: `{
  "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "chain": "solana",
  "symbol": "BONK",
  "riskScore": 100,
  "liquidity": 274347.91,
  "taxBuy": 0,
  "taxSell": 0,
  "honeypot": false,
  "holderCount": 1012305,
  "lastUpdated": "2026-09-10T15:10:32.888Z"
}`,
    note: "Returns 404 if the token isn't tracked yet.",
  },
  {
    id: "kol-stats",
    method: "GET",
    path: "/api/v1/kols/:username/stats",
    title: "KOL win-rate & calls",
    desc: "Returns a KOL's win-rate, average return, and recent call history.",
    curl: `curl "${BASE_URL}/api/v1/kols/kol_alpha/stats"`,
    response: `{
  "username": "kol_alpha",
  "displayName": "Alpha Caller",
  "winRate": 60,
  "avgReturn": 36,
  "totalCalls": 15,
  "updatedAt": "2026-09-10T14:00:00.000Z",
  "recentCalls": [
    { "tokenAddress": "...", "symbol": "BONK", "calledAt": "..." }
  ]
}`,
    note: "Returns 404 if the username isn't tracked yet.",
  },
];

export default function DocsPage() {
  return (
    <div className="docs">
      <div className="docs__bg" />

      <header className="docs__nav">
        <div className="wrap docs__nav-inner">
          <a href="/" className="docs__brand">
            <img src="/logo-1.png" alt="Vetted" />
            Vetted
          </a>
          <a href="/" className="docs__back">
            ← Back to site
          </a>
        </div>
      </header>

      <div className="wrap docs__hero">
        <span className="docs__eyebrow">API Reference</span>
        <h1>Build on Vetted&apos;s data.</h1>
        <p>
          Two read-only endpoints, open access during beta — no API key
          required yet. Everything returns JSON.
        </p>
      </div>

      <div className="wrap docs__layout">
        <nav className="docs__sidebar">
          <span className="docs__sidebar-label">Endpoints</span>
          {ENDPOINTS.map((e) => (
            <a key={e.id} href={`#${e.id}`} className="docs__sidebar-link">
              <span className="docs__method docs__method--sm">{e.method}</span>
              {e.title}
            </a>
          ))}
        </nav>

        <div className="docs__content">
          <div className="docs__notice">
            <b>Beta notice:</b> these endpoints are unauthenticated and rate
            limits may apply informally. Don&apos;t rely on this for
            production traffic yet — an API key system is planned before
            general availability.
          </div>

          {ENDPOINTS.map((e) => (
            <section className="docs__card" id={e.id} key={e.id}>
              <div className="docs__card-head">
                <span className="docs__method">{e.method}</span>
                <code className="docs__path">{e.path}</code>
              </div>
              <h2>{e.title}</h2>
              <p>{e.desc}</p>

              <div className="docs__block">
                <div className="docs__block-head">
                  <span>Request</span>
                  <CopyButton value={e.curl} />
                </div>
                <pre className="docs__code">{e.curl}</pre>
              </div>

              <div className="docs__block">
                <div className="docs__block-head">
                  <span>Response</span>
                  <CopyButton value={e.response} />
                </div>
                <pre className="docs__code">{e.response}</pre>
              </div>

              <p className="docs__note">{e.note}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
