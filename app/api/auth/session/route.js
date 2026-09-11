import { getSessionUser } from "@/lib/getSessionUser";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });
  return Response.json(user);
}
