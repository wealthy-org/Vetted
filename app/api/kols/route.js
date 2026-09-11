import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";

export const dynamic = "force-dynamic";

// This is currently a single global KOL list, not per-user, and the
// Settings page that used it is hidden from nav until it's either wired
// to real per-user tracking or connected to live scraping. Auth-gating it
// here regardless — an unauthenticated actor should never be able to
// mutate (or cascade-delete the calls of) the shared tracked-KOL list.

export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await sql`
    select id, x_username, display_name, added_at
    from kols
    order by added_at desc
  `;
  return Response.json({ items: rows });
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { xUsername, displayName } = await request.json();
  if (!xUsername) {
    return Response.json({ error: "xUsername is required" }, { status: 400 });
  }

  const clean = xUsername.replace(/^@/, "");

  const rows = await sql`
    insert into kols (x_username, display_name)
    values (${clean}, ${displayName ?? clean})
    on conflict (x_username) do nothing
    returning id, x_username, display_name, added_at
  `;

  return Response.json({ item: rows[0] ?? null });
}

export async function DELETE(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await sql`delete from kols where id = ${id}`;
  return Response.json({ ok: true });
}
