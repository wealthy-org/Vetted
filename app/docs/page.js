export const metadata = {
  title: "API Docs — Vetted",
};

const BASE_URL = "https://vetted-peach.vercel.app";

export default function DocsPage() {
  return (
    <div className="docs">
      <div className="wrap docs__wrap">
        <a href="/" className="docs__back">
          ← Back to Vetted
        </a>

        <h1>API Documentation</h1>
        <p className="docs__lead">
          Two read-only endpoints, open access during beta — no API key
          required yet. Both return JSON.
        </p>

        <div className="docs__notice">
          <b>Beta notice:</b> these endpoints are unauthenticated and rate
          limits may apply informally. Don&apos;t rely on this for
          production traffic yet — an API key system is planned before
          general availability.
        </div>

        <section className="docs__section">
          <h2>GET /api/v1/tokens/:address/score</h2>
          <p>Returns the current risk score and on-chain data for a token.</p>
          <pre className="docs__code">
{`curl "${BASE_URL}/api/v1/tokens/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/score"`}
          </pre>
          <p className="docs__label">Response</p>
          <pre className="docs__code">
{`{
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
}`}
          </pre>
          <p className="docs__note">Returns <code>404</code> if the token isn&apos;t tracked yet.</p>
        </section>

        <section className="docs__section">
          <h2>GET /api/v1/kols/:username/stats</h2>
          <p>Returns a KOL&apos;s win-rate, average return, and recent call history.</p>
          <pre className="docs__code">
{`curl "${BASE_URL}/api/v1/kols/kol_alpha/stats"`}
          </pre>
          <p className="docs__label">Response</p>
          <pre className="docs__code">
{`{
  "username": "kol_alpha",
  "displayName": "Alpha Caller",
  "winRate": 60,
  "avgReturn": 36,
  "totalCalls": 15,
  "updatedAt": "2026-09-10T14:00:00.000Z",
  "recentCalls": [
    { "tokenAddress": "...", "symbol": "BONK", "calledAt": "..." }
  ]
}`}
          </pre>
          <p className="docs__note">Returns <code>404</code> if the username isn&apos;t tracked yet.</p>
        </section>
      </div>
    </div>
  );
}
