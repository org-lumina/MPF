import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/pedidos
// Guarda un pedido de simulador en Supabase (tabla pedidos_examen).
// Público (no requiere login). Usa la SECRET KEY en el servidor; nunca se expone.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { nombre_apellido?: string; examen_pedido?: string }
    | null;

  const nombre = (body?.nombre_apellido ?? "").trim();
  const examen = (body?.examen_pedido ?? "").trim();

  if (!nombre) {
    return NextResponse.json({ error: "Ingresá tu nombre y apellido." }, { status: 400 });
  }
  if (!examen) {
    return NextResponse.json({ error: "Contanos qué examen te gustaría." }, { status: 400 });
  }
  if (examen.length > 300) {
    return NextResponse.json({ error: "El pedido no puede superar los 300 caracteres." }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("pedidos_examen").insert({
      nombre_apellido: nombre.slice(0, 200),
      examen_pedido: examen,
    });
    if (error) {
      return NextResponse.json({ error: "No se pudo guardar el pedido." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Servicio no disponible (revisá la conexión a Supabase)." },
      { status: 500 }
    );
  }
}
