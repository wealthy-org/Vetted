"use client";

import { useCallback, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { buildSignInMessage } from "@/lib/authMessage";

// Runs the full connect -> nonce -> sign -> verify flow and results in a
// real httpOnly session cookie (see app/api/auth/verify). Wallet "connect"
// alone proves nothing server-side; this is what actually authenticates.
export function useWalletAuth() {
  const { publicKey, signMessage } = useWallet();
  const [status, setStatus] = useState("idle"); // idle | signing | error | done
  const inFlight = useRef(false);

  const authenticate = useCallback(async () => {
    if (inFlight.current) return false;
    if (!publicKey || !signMessage) {
      setStatus("error");
      return false;
    }

    inFlight.current = true;
    setStatus("signing");
    try {
      const wallet = publicKey.toBase58();

      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      if (!nonceRes.ok) throw new Error("nonce request failed");
      const { nonce } = await nonceRes.json();

      const message = buildSignInMessage(wallet, nonce);
      const signatureBytes = await signMessage(new TextEncoder().encode(message));

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          nonce,
          signature: bs58.encode(signatureBytes),
        }),
      });
      if (!verifyRes.ok) throw new Error("signature verification failed");

      setStatus("done");
      return true;
    } catch {
      setStatus("error");
      return false;
    } finally {
      inFlight.current = false;
    }
  }, [publicKey, signMessage]);

  return { authenticate, status };
}
