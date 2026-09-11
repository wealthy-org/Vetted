// Pure, no server secret — safe to import from client components too.
export function buildSignInMessage(wallet, nonce) {
  return `Sign in to Vetted

Wallet: ${wallet}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas.`;
}
