<p align="center">
  <img src="./public/banner.png" alt="Vetted banner" width="100%" />
</p>

# Vetted

Alpha intelligence for crypto traders — track KOL calls on X, auto-validate
on-chain risk, and watch smart money wallets, all cross-referenced in one
dashboard.

## What this is

A landing page + dashboard app. The dashboard is gated behind a Phantom
wallet connect (Solana), and reads/writes a Neon Postgres database via
Next.js Route Handlers.

### Features

| Feature | Where |
|---|---|
| KOL Call Tracker | `/dashboard` (Feed) |
| Risk Score Engine | `lib/risk.js`, shown on every token |
| KOL Leaderboard | `/dashboard/leaderboard`, `/dashboard/kol/[username]` |
| Personal Watchlist | `/dashboard/watchlist` |
| Smart Money Watch | `/dashboard/smart-money` |
| Narrative Tracker | `/dashboard/narratives` |
| Public API | `GET /api/v1/tokens/[address]/score` |
| Token detail (risk breakdown, price trend, call history) | `/dashboard/token/[address]` |

## Stack

- **Next.js 14** (App Router) — deploy target: Vercel
- **Neon** (serverless Postgres) — `lib/db.js`
- **Solana wallet adapter** (Phantom only) for dashboard auth — `app/providers.js`
- No ORM — raw SQL via `@neondatabase/serverless`'s tagged-template `sql`

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL at minimum
node scripts/apply-schema.mjs   # creates all tables in your Neon DB
node scripts/seed.mjs           # populates demo data (real, verified tokens)
npm run dev
```

Open `http://localhost:3000`. To reach `/dashboard` you need the Phantom
browser extension installed — the app never asks for anything beyond a
wallet connection (no signature/approval).

## Environment variables

See `.env.example` for the full list with comments. Only `DATABASE_URL` is
required to run the app locally. Everything else (`CRON_SECRET`,
`TWITTER_*`, `RSSHUB_BASE`, `NEXT_PUBLIC_SOLANA_RPC`) is optional and only
matters once you wire up live scraping / deploy.

## Database

Schema lives in `db/schema.sql` (source of truth for fresh setups) and is
also captured as incremental `scripts/migrate-*.mjs` files (each one is
idempotent — safe to re-run).

```bash
node scripts/apply-schema.mjs        # fresh install: creates every table
node scripts/migrate-add-category.mjs        # + tokens.category
node scripts/migrate-add-price-columns.mjs   # + tokens.price_usd, wallet_activities.price_at_tx
node scripts/migrate-narratives-unique.mjs   # + unique(tag, week_start)
node scripts/migrate-add-price-history.mjs   # + tokens.volume_24h, price_snapshots table
```

(If you're setting up from scratch today, `db/schema.sql` already includes
all of the above — you only need the migration scripts if you're catching
up an existing database created before a given feature was added.)

## Demo / seed data

`scripts/seed.mjs` inserts:
- 28 fictional KOLs (usernames are made up)
- 52 **real, verified** tokens (BONK, WIF, PEPE, AAVE, UNI, etc. — addresses
  checked against the Dexscreener API before being added, so their logos
  resolve from Dexscreener's CDN)
- Real tax/holder data per token, fetched live from GoPlus Security
- Real 24h volume, fetched live from Dexscreener
- ~150 synthetic KOL calls and ~30 synthetic wallet buys/sells, spread over
  fake timestamps, with a synthetic price ratio (`price_at_call` always
  `1`, current `price_usd` a per-token multiplier) so `lib/computeStats.js`
  has real win/loss math to compute KOL win-rates and smart-wallet
  win-rates from — **not hand-typed numbers**
- 12 synthetic historical price points per token (`price_snapshots`) so the
  sparkline on the token detail page has something to draw immediately

Re-running `node scripts/seed.mjs` is safe (checks for existing rows before
inserting). To wipe everything and start over:

```bash
node scripts/reset-demo-data.mjs && node scripts/seed.mjs
```

**Important caveat:** because the price scheme above is synthetic (a demo
ratio, not a real dollar price), the token detail page deliberately does
**not** show a "$" price number — only a relative trend (%) and the
sparkline shape. Once real scraping is live (see below) and `price_usd`
holds real Dexscreener prices, that can change.

## Live scraping (KOL Call Tracker) — status: not wired up

Getting fresh tweet data without an official X API subscription turned out
to be the hardest part of this project. What was tried, in order:

1. **RSSHub** (public instance) — dead, redirects to a 404.
2. **9+ public Nitter instances** — all dead or blocked by Cloudflare bot
   detection.
3. **`@the-convocation/twitter-scraper`, no login** — works technically
   (no credentials, runs fine on Vercel since it's plain HTTP, not a
   headless browser) but X only serves **stale/cached** tweets to
   unauthenticated requests — useless for a real-time tracker.
4. **Same library, logged in with a real X account** — blocked with a
   `403` from Cloudflare at the login step itself, tested from this dev
   environment's server IP. Untested from a residential IP.

Two paths forward, neither wired up by default:

- **`scripts/scrape-local.mjs`** — run this from your own machine (not
  deployed anywhere) with `TWITTER_USERNAME`/`TWITTER_PASSWORD` set in
  `.env.local`. Logs into a real X account and writes new calls straight
  to the database. Use a throwaway account, not your main one — X can flag
  accounts used for automation.
- **A paid API** (`twitter.fetcher.sh` at ~$0.005/request via x402 crypto
  micropayments, or `socialdata.tools`, or the official X API at ~$200/mo)
  — would replace `lib/rss.js`'s implementation; the rest of the pipeline
  (`app/api/cron/scrape/route.js`) is already built to consume whatever
  that function returns.

## Background jobs (cron)

Two routes need to be hit on a schedule. **Not using Vercel Cron** — an
external scheduler (cron-job.org, GitHub Actions, etc.) calls these over
HTTP instead, since Vercel's Hobby plan cron is too limited (2 jobs,
daily-only):

```
GET /api/cron/scrape          — every ~10 min (once a scraping source is live)
GET /api/cron/compute-stats   — every ~1 hour
Header: Authorization: Bearer <CRON_SECRET>
```

`compute-stats` does two things each run: refreshes `price_usd`/
`volume_24h` from Dexscreener for every token (`lib/refreshPrices.js`,
which also appends a `price_snapshots` row), then recomputes every KOL's
and smart wallet's win-rate from real price history
(`lib/computeStats.js`).

## Known gaps / things a reviewer should know

- **Wallet auth is connect-only** — no signed challenge/response yet, so
  it can technically be spoofed via devtools. Fine for a demo, needs
  hardening (sign a nonce message, verify server-side) before real users.
- **Live scraping isn't connected** — see above. Everything downstream
  (risk scoring, win-rate computation, cross-referencing) is real code
  that works against real data; it's specifically the "get fresh tweets
  without paying" problem that's unsolved.
- **Pricing page** — intentionally not built yet (deferred).
- Next.js is pinned to **14.2.35**; latest is 16.x. Upgrading is
  straightforward but hasn't been prioritized.

## Project structure

```
app/
  page.js                    — landing page
  layout.js, providers.js    — root layout, Solana wallet provider
  dashboard/
    DashboardShell.js        — sidebar, topbar, wallet gate
    page.js                  — Feed (KOL calls, paginated, filterable)
    leaderboard/, watchlist/, smart-money/, narratives/, settings/
    token/[address]/         — token detail (risk breakdown, price trend)
    kol/[username]/          — KOL profile (call history, win-rate)
  api/
    cron/scrape, cron/compute-stats   — background jobs
    auth/connect, watchlist, kols     — app data endpoints
    v1/tokens/[address]/score         — public API
lib/                          — pure functions: risk scoring, categorization,
                                 external API clients (Dexscreener, GoPlus,
                                 RSS), stats computation, db connection
scripts/                      — one-off/maintenance: schema, migrations,
                                 seeding, local scraper
db/schema.sql                 — full schema, source of truth
```
