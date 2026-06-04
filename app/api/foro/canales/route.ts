import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requerirAccesoApi } from "@/lib/foro";

// POST /api/foro/canales  → crear un canal. SOLO admin (validado server-side).
export async function POST(req: Request) {
  const s = await requerirAccesoApi();
  if ("res" in s) return s.res;
  if (!s.admin) {
    return NextResponse.json({ error: "Solo un administrador puede crear canales." }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { nombre?: string } | null;
  const nombre = (body?.nombre ?? "").trim();
  if (!nombre) {
    return NextResponse.json({ error: "El canal necesita un título." }, { status: 400 });
  }
  if (nombre.length > 120) {
    return NextResponse.json({ error: "El título no puede superar los 120 caracteres." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("foro_canales")
    .insert({ nombre })
    .select("id, nombre, creado")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear el canal." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, canal: data });
}
