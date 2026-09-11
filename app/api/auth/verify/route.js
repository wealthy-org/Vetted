import nacl from "tweetnacl";
import bs58 from "bs58";
import { sql } from "@/lib/db";
import { verifyNonceToken, createSessionCookie, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { buildSignInMessage } from "@/lib/authMessage";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { wallet, nonce, signature } = await request.json();
  if (!wallet || !nonce || !signature) {
    return Response.json(
      { error: "wallet, nonce, and signature are required" },
      { status: 400 }
    );
  }

  const nonceValid = await verifyNonceToken(nonce, wallet);
  if (!nonceValid) {
    return Response.json(
      { error: "Nonce expired or invalid — reconnect and try again" },
      { status: 401 }
    );
  }

  let pubkeyBytes, signatureBytes;
  try {
    pubkeyBytes = bs58.decode(wallet);
    signatureBytes = bs58.decode(signature);
  } catch {
    return Response.json({ error: "Malformed wallet or signature" }, { status: 400 });
  }

  const message = buildSignInMessage(wallet, nonce);
  const messageBytes = new TextEncoder().encode(message);
  const validSignature = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);

  if (!validSignature) {
    return Response.json({ error: "Signature verification failed" }, { status: 401 });
  }

  await sql`
    insert into users (wallet_address)
    values (${wallet})
    on conflict (wallet_address) do update set wallet_address = excluded.wallet_address
  `;

  const cookieValue = await createSessionCookie(wallet);
  const res = Response.json({ ok: true, wallet });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`
  );
  return res;
}
