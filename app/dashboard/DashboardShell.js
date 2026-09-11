"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserProvider } from "./UserContext";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const ICONS = {
  feed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  leaderboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21h8M12 17v4M17 4h4v3a5 5 0 0 1-5 5M7 4H3v3a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" strokeLinejoin="round" />
    </svg>
  ),
  watchlist: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.6L12 2z" strokeLinejoin="round" />
    </svg>
  ),
  smartMoney: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 14c2-4 4-6 8-6s6 2 8 6M2 14h20M6 18h.01M18 18h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  narratives: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M7 15l4-5 3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Feed", icon: "feed" },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: "watchlist" },
  { href: "/dashboard/smart-money", label: "Smart Money", icon: "smartMoney" },
  { href: "/dashboard/narratives", label: "Narratives", icon: "narratives" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default function DashboardShell({ children }) {
  // Access to every /dashboard page is already enforced server-side by
  // middleware.js, which checks the signed session cookie before any page
  // renders. This component no longer needs to gate anything itself — it
  // only reflects wallet connection state for the UI (address chip) and
  // clears the session if the user disconnects their wallet.
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const wasConnectedThisSession = useRef(false);

  useEffect(() => {
    if (connected) {
      wasConnectedThisSession.current = true;
      return;
    }
    if (!connected && wasConnectedThisSession.current) {
      wasConnectedThisSession.current = false;
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        router.push("/");
      });
    }
  }, [connected, router]);

  const current = NAV_ITEMS.find((i) => i.href === pathname);
  const walletAddress = publicKey?.toBase58() ?? null;

  return (
    <UserProvider>
      <div className="dash">
        <aside className="dash__sidebar">
          <div className="dash__logo">
            <img src="/logo-1.png" alt="Vetted logo" />
            Vetted
          </div>
          <div className="dash__nav-label">Menu</div>
          <nav className="dash__nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
              >
                <span className="dash__nav-icon">{ICONS[item.icon]}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="dash__wallet">
            <WalletMultiButton />
          </div>
        </aside>
        <div className="dash__body">
          <header className="dash__topbar">
            <div className="dash__breadcrumb">
              <span className="dash__breadcrumb-dim">Vetted</span>
              <span className="dash__breadcrumb-sep">/</span>
              <span>{current?.label ?? "Dashboard"}</span>
            </div>
            <div className="dash__topbar-right">
              <span className="dash__network">
                <span className="dash__network-dot" />
                Mainnet
              </span>
              {walletAddress && (
                <span className="dash__wallet-chip">
                  {walletAddress.slice(0, 4)}..{walletAddress.slice(-4)}
                </span>
              )}
            </div>
          </header>
          <main className="dash__main">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
