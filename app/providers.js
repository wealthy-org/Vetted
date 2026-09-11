"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("mainnet-beta"),
    []
  );
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // wallet-adapter console.errors every wallet error by default, including
  // the user simply clicking "Cancel" in the Phantom popup — that's normal,
  // expected behavior handled gracefully in lib/useWalletAuth.js, not a
  // bug worth logging. Only log genuinely unexpected error types.
  function onWalletError(error) {
    if (error?.name === "WalletSignMessageError" || error?.name === "WalletNotConnectedError") {
      return;
    }
    console.error(error);
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onWalletError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
