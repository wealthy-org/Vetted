// Signed, stateless auth tokens (nonce + session cookie) built on the Web
// Crypto API only — no Buffer, no extra dependency, works identically in
// Next.js's Node runtime (route handlers) and Edge runtime (middleware).

export const SESSION_COOKIE = "vetted_session";
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes to complete the sign step
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

function toBase64Url(bytes) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// --- Nonce: proves the sign-in attempt is fresh, without a DB round trip ---

export async function createNonce(wallet) {
  const exp = Date.now() + NONCE_TTL_MS;
  const payload = `${wallet}.${exp}`;
  const sig = await hmacSign(getSecret(), payload);
  return `${payload}.${sig}`;
}

export async function verifyNonceToken(token, wallet) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tWallet, expStr, sig] = parts;
  if (tWallet !== wallet) return false;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;
  const expected = await hmacSign(getSecret(), `${tWallet}.${expStr}`);
  return timingSafeEqual(expected, sig);
}

// --- Session cookie: issued once the wallet signature checks out ---

export async function createSessionCookie(wallet) {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${wallet}.${exp}`;
  const sig = await hmacSign(getSecret(), payload);
  return `${payload}.${sig}`;
}

export async function verifySessionCookie(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [wallet, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;
  const expected = await hmacSign(getSecret(), `${wallet}.${expStr}`);
  if (!timingSafeEqual(expected, sig)) return null;
  return { wallet };
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
