import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requerirAccesoApi } from "@/lib/foro";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/foro/canales/[id]  → borrar canal (y sus mensajes por cascade).
// SOLO admin. No se permite borrar el último canal.
export async function DELETE(_req: Request, { params }: Ctx) {
  const s = await requerirAccesoApi();
  if ("res" in s) return s.res;
  if (!s.admin) {
    return NextResponse.json({ error: "Solo un administrador puede borrar canales." }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Canal inválido." }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { count } = await sb
    .from("foro_canales")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return NextResponse.json({ error: "No se puede borrar el único canal." }, { status: 400 });
  }

  const { error } = await sb.from("foro_canales").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "No se pudo borrar el canal." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
