import GetStartedButton from "./GetStartedButton";

const heroCodeHtml = `
  <div class="dots"><span></span><span></span><span></span></div>
  <span class="kw">import</span> { Vetted } <span class="kw">from</span> <span class="str">'vetted-sdk'</span><br><br>
  <span class="cm">// track a KOL in real time</span><br>
  <span class="kw">await</span> <span class="fn">Vetted.track</span>({<br>
  &nbsp;&nbsp;kol: <span class="str">"@elonmusk"</span>,<br>
  &nbsp;&nbsp;autoScore: <span class="kw">true</span><br>
  })
`;

const apiPanelHtml = `
  <div class="dots"><span></span><span></span><span></span></div>
  <span class="cm">GET</span> /v1/tokens/<span class="s">7xKX...p92m</span>/score<br><br>
  {<br>
  &nbsp;&nbsp;<span class="k">"riskScore"</span>: <span class="n">82</span>,<br>
  &nbsp;&nbsp;<span class="k">"liquidity"</span>: <span class="n">11800</span>,<br>
  &nbsp;&nbsp;<span class="k">"taxBuy"</span>: <span class="n">0.56</span>,<br>
  &nbsp;&nbsp;<span class="k">"taxSell"</span>: <span class="n">1.56</span>,<br>
  &nbsp;&nbsp;<span class="k">"honeypot"</span>: <span class="s">false</span><br>
  }
`;

export default function Home() {
  return (
    <>
      <div className="announce">
        Vetted beta is now open — <a href="#">Join the waitlist →</a>
      </div>

      <div className="hero-outer">
        <div className="wrap">
          <nav className="main">
            <div className="logo">
              <img src="/logo-1.png" className="dot" alt="Vetted logo" />
              Vetted
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#testi">Why Us</a>
              <a href="#api">API</a>
              <a href="#">Pricing</a>
            </div>
            <GetStartedButton className="btn btn--primary">
              Get Started →
            </GetStartedButton>
          </nav>

          <section className="hero">
            <div>
              <div className="hero__eyebrow">
                <span className="avatars">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                Built for traders who verify before they ape
              </div>
              <h1>
                Don&apos;t let a
                <br />
                rug pull drain
                <br />
                your portfolio.
              </h1>
              <p>
                Track KOL calls, auto-validate on-chain risk, and watch smart
                money — all in one dashboard.
              </p>
              <div className="hero__cta-row">
                <GetStartedButton className="btn btn--primary">
                  Get Started →
                </GetStartedButton>
                <span className="hero__mini-note">
                  No credit card · <b>Just connect Phantom</b>
                </span>
              </div>
              <div className="hero__quickstats">
                <div>
                  <b>5+</b>
                  <span>Data sources tracked</span>
                </div>
                <div>
                  <b>&lt;10s</b>
                  <span>Alert latency</span>
                </div>
                <div>
                  <b>24/7</b>
                  <span>Continuous monitoring</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div
                className="card card--code"
                dangerouslySetInnerHTML={{ __html: heroCodeHtml }}
              />
              <div className="card card--form">
                <div className="card--form__head">
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--gray)" }}
                  >
                    LIVE RISK CHECK
                  </span>
                  <span className="live">
                    <span className="dot-pulse"></span>Live
                  </span>
                </div>
                <div className="row">
                  <span>$ZDOG</span>
                  <b>
                    <span className="pill pill--ok">Safe · 82</span>
                  </b>
                </div>
                <div className="row">
                  <span>Liquidity</span>
                  <b>$11.8K</b>
                </div>
                <div className="row">
                  <span>Tax buy/sell</span>
                  <b>0.56% / 1.56%</b>
                </div>
                <div className="row">
                  <span>$HOODSUP</span>
                  <b>
                    <span className="pill pill--warn">Unpaid · 41</span>
                  </b>
                </div>
              </div>
              <div className="card card--badge">
                <div className="ico">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <b>@elonmusk</b>
                  <span>68% win rate · 42 calls tracked</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="strip">
        <div className="wrap strip__inner">
          <div className="strip__stat">
            <b>5+</b>
            <span>on-chain & social data sources cross-checked</span>
          </div>
          <div className="strip__stat">
            <b>&lt;10s</b>
            <span>from tweet detected to risk score delivered</span>
          </div>
          <div className="strip__stat">
            <b>12</b>
            <span>signals evaluated per call</span>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="wrap">
          <div className="how__head">
            <div className="kicker">How it works</div>
            <h2>From tweet to verdict, automatically.</h2>
          </div>
          <div className="how__steps">
            <div className="step">
              <div className="step__num">01</div>
              <h3>Watch the calls</h3>
              <p>
                We follow the KOL accounts you choose and catch every
                contract address the moment it&apos;s tweeted.
              </p>
            </div>
            <div className="step">
              <div className="step__num">02</div>
              <h3>Validate on-chain</h3>
              <p>
                Liquidity, tax, holder distribution, and honeypot risk are
                pulled and scored automatically.
              </p>
            </div>
            <div className="step">
              <div className="step__num">03</div>
              <h3>Get the verdict</h3>
              <p>
                A single alert with the call, the risk score, and the
                KOL&apos;s historical win rate — ready to act on.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="wrap">
          <h2>Don&apos;t settle for guesswork.</h2>
          <p>Seven tools that turn a raw tweet into a verified, actionable signal.</p>
          <div className="features__grid">
            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.5a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>KOL Call Tracker</h3>
              </div>
              <p>
                Automatically detects contract addresses tweeted by your
                favorite crypto KOLs, in real time.
              </p>
              <div className="f-preview">
                <div className="fp-row">
                  <span className="fp-name">🐦 @elonmusk</span>
                  <span className="fp-val">2s ago</span>
                </div>
                <div className="fp-row">
                  <span
                    className="fp-name"
                    style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}
                  >
                    7xKX...p92m
                  </span>
                  <span className="fp-val good">detected</span>
                </div>
              </div>
            </div>

            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                      strokeLinejoin="round"
                    />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Risk Score Engine</h3>
              </div>
              <p>
                Every token that surfaces gets auto-checked for liquidity,
                tax, and honeypot risk.
              </p>
              <div className="f-preview fp-gauge">
                <svg width="40" height="40" viewBox="0 0 46 46">
                  <circle cx="23" cy="23" r="19" stroke="rgba(255,255,255,.08)" strokeWidth="5" fill="none" />
                  <circle
                    cx="23"
                    cy="23"
                    r="19"
                    stroke="#00c896"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray="119.4"
                    strokeDashoffset="24"
                    strokeLinecap="round"
                    transform="rotate(-90 23 23)"
                  />
                </svg>
                <div className="fp-gauge-text">
                  <b>
                    82
                    <span style={{ fontSize: 11, color: "#5c6079", fontWeight: 400 }}>
                      /100
                    </span>
                  </b>
                  <span>Liquidity, tax & holder check passed</span>
                </div>
              </div>
            </div>

            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M8 21h8M12 17v4M17 4h4v3a5 5 0 0 1-5 5M7 4H3v3a5 5 0 0 0 5 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>KOL Leaderboard</h3>
              </div>
              <p>See which KOLs actually call it right, ranked by historical win rate.</p>
              <div className="f-preview">
                <div className="fp-row">
                  <span className="fp-name">
                    <span className="fp-rank">1</span>@elonmusk
                  </span>
                  <span className="fp-val good">71%</span>
                </div>
                <div className="fp-row">
                  <span className="fp-name">
                    <span className="fp-rank">2</span>@fadedcalls
                  </span>
                  <span className="fp-val">64%</span>
                </div>
                <div className="fp-row">
                  <span className="fp-name">
                    <span className="fp-rank">3</span>@cryptoray
                  </span>
                  <span className="fp-val">58%</span>
                </div>
              </div>
            </div>

            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.6L12 2z"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Personal Watchlist</h3>
              </div>
              <p>
                Save tokens you&apos;re watching and track performance from
                the moment they were called.
              </p>
              <div className="f-preview">
                <div className="fp-row">
                  <span className="fp-name">
                    <span className="fp-star">★</span> $ZDOG
                  </span>
                  <span className="fp-val good">+253%</span>
                </div>
                <div className="fp-row">
                  <span className="fp-name">
                    <span className="fp-star">★</span> $HOODSUP
                  </span>
                  <span className="fp-val">+12%</span>
                </div>
              </div>
            </div>

            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M4 14c2-4 4-6 8-6s6 2 8 6M2 14h20M6 18h.01M18 18h.01"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Smart Money Watch</h3>
              </div>
              <p>Get notified the moment a profitable wallet enters a new token.</p>
              <div className="f-preview">
                <div className="fp-row">
                  <span
                    className="fp-name"
                    style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}
                  >
                    3xRp...9kLo
                  </span>
                  <span className="fp-arrow">→</span>
                  <span className="fp-val good">$ZDOG</span>
                </div>
                <div className="fp-row">
                  <span className="fp-name">Wallet win rate</span>
                  <span className="fp-val">89%</span>
                </div>
              </div>
            </div>

            <div className="f-item">
              <div className="f-item__head">
                <div className="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M3 3v18h18M7 15l4-5 3 3 5-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Narrative Tracker</h3>
              </div>
              <p>Spot the meta that&apos;s heating up, aggregated from weekly on-chain data.</p>
              <div className="f-preview">
                <div className="fp-bars">
                  <div className="fp-bar" style={{ height: "35%" }}></div>
                  <div className="fp-bar" style={{ height: "60%" }}></div>
                  <div className="fp-bar" style={{ height: "100%" }}></div>
                  <div className="fp-bar" style={{ height: "45%" }}></div>
                  <div className="fp-bar" style={{ height: "70%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testi" id="testi">
        <div className="wrap testi__inner">
          <div className="testi__mark">
            <div className="kicker">The problem</div>
            <div className="big">
              3 tabs.
              <br />
              1 call.
              <br />
              Seconds
              <br />
              to react.
            </div>
          </div>
          <div>
            <h2>Why we built this.</h2>
            <div className="quote">
              <span style={{ fontSize: 15, color: "var(--ink)" }}>
                A KOL tweets a contract address. You scramble to open
                Dexscreener, check liquidity, check tax, check holders — all
                manual, in the seconds that actually matter.
              </span>
            </div>
            <div className="quote">
              <span style={{ fontSize: 15, color: "var(--ink)" }}>
                Vetted runs that check automatically, before you&apos;ve even
                finished reading the tweet — so the decision is informed, not
                impulsive.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="logos">
        <div className="wrap">
          <p>Data & infrastructure we rely on</p>
          <div className="logos__marquee">
            <div className="logos__track">
              {[0, 1].map((i) => (
                <LogoRow key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="api" id="api">
        <div className="wrap api__inner">
          <div>
            <div className="api__kicker">For developers</div>
            <h2>Ship your own alpha tools on our data.</h2>
            <p className="lead">
              Every risk score and KOL stat we compute is available as a
              simple REST API — build your own bot, dashboard, or trading
              tool on top.
            </p>
            <ul className="api__list">
              <li>
                <span className="check">✓</span>Pull real-time risk scores
                for any token by contract address
              </li>
              <li>
                <span className="check">✓</span>Query KOL win-rate and call
                history programmatically
              </li>
              <li>
                <span className="check">✓</span>Open access during beta —
                no API key required yet
              </li>
            </ul>
            <a className="btn btn--primary" href="/docs">
              Read the docs →
            </a>
          </div>
          <div
            className="api__panel"
            dangerouslySetInnerHTML={{ __html: apiPanelHtml }}
          />
        </div>
      </section>

      <section className="faq">
        <div className="wrap faq__inner">
          <div className="faq__head">
            <div className="kicker">FAQ</div>
            <h2>Common questions.</h2>
            <p>Everything you need to know before you connect your first watchlist.</p>
          </div>
          <div>
            <div className="faq-item">
              <h3>Do I need to connect a wallet?</h3>
              <p>
                Yes — you sign in with Phantom to prove you&apos;re a real
                trader. We only ever ask for a connection, never a token
                approval or transaction.
              </p>
            </div>
            <div className="faq-item">
              <h3>Which chains are supported?</h3>
              <p>Solana and EVM chains (Ethereum, BNB) at launch, with more added as demand grows.</p>
            </div>
            <div className="faq-item">
              <h3>Can I choose which KOLs to track?</h3>
              <p>Yes — build your own watchlist of accounts, or start from our curated default list.</p>
            </div>
            <div className="faq-item">
              <h3>Is this financial advice?</h3>
              <p>No. Vetted surfaces data to help you decide faster — it never tells you to buy or sell.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>An alert widget, ready to go.</h2>
          <p>A sample of the notification you&apos;d get every time a new call comes in.</p>
          <div className="cta-mock-wrap">
            <div className="cta-mock">
              <div className="cta-mock__head">
                <div className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path
                      d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <b>Vetted</b>
                  <span>New call detected</span>
                </div>
                <span className="time">now</span>
              </div>
              <div className="row">
                <span>
                  @elonmusk called <b>$ZDOG</b>
                </span>
                <span className="pill pill--ok">+253.7%</span>
              </div>
              <div className="row">
                <span>Liquidity</span>
                <b>$11.8K</b>
              </div>
              <div className="row">
                <span>Risk Score</span>
                <span className="pill pill--warn">42/100</span>
              </div>
              <div className="row">
                <span>KOL Win Rate</span>
                <b>68%</b>
              </div>
            </div>
          </div>
          <br />
          <GetStartedButton className="btn btn--primary" style={{ position: "relative" }}>
            Get Started →
          </GetStartedButton>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer__top">
            <div className="footer__col">
              <div className="footer__brand">
                <img src="/logo-1.png" className="dot" alt="Vetted logo" />
                Vetted
              </div>
              <p style={{ fontSize: 13.5, maxWidth: 220, lineHeight: 1.6 }}>
                Alpha intelligence for traders who cross-check before they
                click buy.
              </p>
            </div>
            <div className="footer__col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer__col">
              <h4>Resources</h4>
              <a href="#">Docs</a>
              <a href="#">API</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer__col">
              <h4>Community</h4>
              <a href="#">Twitter / X</a>
              <a href="#">Discord</a>
              <a href="#">Telegram</a>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© 2026 Vetted. Data for research purposes, not financial advice.</span>
            <span>Built for traders, not by exit liquidity.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function LogoRow() {
  return (
    <>
      <div className="logo-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l5-9 4 6 3-4 6 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Dexscreener
      </div>
      <div className="logo-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        GoPlus Security
      </div>
      <div className="logo-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" />
        </svg>
        Solscan
      </div>
      <div className="logo-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" strokeLinejoin="round" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
        Supabase
      </div>
      <div className="logo-item">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L22 20H2L12 2z" />
        </svg>
        Vercel
      </div>
    </>
  );
}
