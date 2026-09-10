import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`
    select id, x_username, display_name, added_at
    from kols
    order by added_at desc
  `;
  return Response.json({ items: rows });
}

export async function POST(request) {
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
  const { id } = await request.json();
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await sql`delete from kols where id = ${id}`;
  return Response.json({ ok: true });
}
