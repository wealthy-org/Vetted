"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const UserContext = createContext({ userId: null, wallet: null });

export function UserProvider({ children }) {
  const { publicKey, connected } = useWallet();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setUserId(null);
      return;
    }
    const wallet = publicKey.toBase58();
    fetch("/api/auth/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then((res) => res.json())
      .then((data) => setUserId(data.id))
      .catch(() => setUserId(null));
  }, [connected, publicKey]);

  return (
    <UserContext.Provider
      value={{ userId, wallet: publicKey?.toBase58() ?? null }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useAppUser() {
  return useContext(UserContext);
}
