"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext({ userId: null, wallet: null });

export function UserProvider({ children }) {
  const [user, setUser] = useState({ userId: null, wallet: null });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser({ userId: data.userId, wallet: data.wallet });
      })
      .catch(() => {});
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useAppUser() {
  return useContext(UserContext);
}
