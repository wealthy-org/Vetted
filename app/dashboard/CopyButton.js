"use client";

import { useState } from "react";

export default function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? "Copied!" : label}
    </button>
  );
}
