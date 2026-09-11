import { NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/session";

// Runs before any /dashboard page renders. Without this, an unauthenticated
// request still gets the full server-rendered payload (real KOL/token data)
// back in the response — the old client-side-only gate only hid it visually
// in the browser, it never stopped the server from sending it.
export async function middleware(request) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionCookie(cookie);

  if (!session) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
