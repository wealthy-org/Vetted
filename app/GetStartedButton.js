"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "@/lib/useWalletAuth";

export default function GetStartedButton({ className, style, children }) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { authenticate, status } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!connected || status !== "idle") return;

    let cancelled = false;

    // wallet-adapter's autoConnect re-connects the wallet on every page
    // load, including back on the landing page after a user already
    // signed in earlier. Without this check we'd fire a brand new sign
    // request every single time — check for an existing valid session
    // first, and only fall through to the nonce+sign+verify flow if
    // there genuinely isn't one yet.
    fetch("/api/auth/session").then((res) => {
      if (cancelled) return;
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      authenticate().then((ok) => {
        if (ok) router.push("/dashboard");
      });
    });

    return () => {
      cancelled = true;
    };
  }, [connected, status, authenticate, router]);

  function handleClick(e) {
    e.preventDefault();
    if (!connected) {
      setVisible(true);
      return;
    }
    if (status === "error") {
      authenticate().then((ok) => {
        if (ok) router.push("/dashboard");
      });
    }
  }

  const label =
    status === "signing"
      ? "Confirm in wallet…"
      : status === "error"
      ? "Signature failed — click to retry"
      : children;

  return (
    <a href="/dashboard" className={className} style={style} onClick={handleClick}>
      {label}
    </a>
  );
}
