import { createNonce } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { wallet } = await request.json();
  if (!wallet || typeof wallet !== "string") {
    return Response.json({ error: "wallet is required" }, { status: 400 });
  }

  const nonce = await createNonce(wallet);
  return Response.json({ nonce });
}
