import { sql } from "@/lib/db";
import { refreshTokenPrices } from "@/lib/refreshPrices";
import { computeAllStats } from "@/lib/computeStats";

// Without this, Next.js tries to statically prerender (i.e. actually
// execute, against the real database) this route at `next build` time.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const priceResult = await refreshTokenPrices(sql);
  const statsResult = await computeAllStats(sql);

  return Response.json({
    ranAt: new Date().toISOString(),
    ...priceResult,
    ...statsResult,
  });
}
