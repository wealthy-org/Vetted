import { sql } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/session";

// Resolves the authenticated user from the signed session cookie — never
// from a client-supplied userId/wallet. Route handlers that mutate
// per-user data must use this instead of trusting request body/query.
export async function getSessionUser(request) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionCookie(cookie);
  if (!session) return null;

  const rows = await sql`
    select id from users where wallet_address = ${session.wallet} limit 1
  `;
  if (!rows[0]) return null;

  return { userId: rows[0].id, wallet: session.wallet };
}
