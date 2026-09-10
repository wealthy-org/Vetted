"use client";

import { useState } from "react";
import { useAppUser } from "./UserContext";

export default function AddToWatchlistButton({ tokenAddress }) {
  const { userId } = useAppUser();
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (!userId) return;
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, tokenAddress }),
    });
    setAdded(true);
  }

  return (
    <button className="dp__add" onClick={handleClick} disabled={!userId || added}>
      {added ? "Added" : "+ Watchlist"}
    </button>
  );
}
