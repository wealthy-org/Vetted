"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

// Skips the /dashboard gate screen entirely: clicking this opens the
// wallet-select modal right here on the landing page, and once a wallet
// actually connects, sends the user straight into the dashboard.
export default function GetStartedButton({ className, style, children }) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  function handleClick(e) {
    if (!connected) {
      e.preventDefault();
      setVisible(true);
    }
  }

  return (
    <a href="/dashboard" className={className} style={style} onClick={handleClick}>
      {children}
    </a>
  );
}
