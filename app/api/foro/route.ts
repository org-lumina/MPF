import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requerirAccesoApi } from "@/lib/foro";

// POST /api/foro  → crear un mensaje en un canal.
// Requiere acceso vigente. Autor (email/nombre) tomado de la SESIÓN, no del body.
export async function POST(req: Request) {
  const s = await requerirAccesoApi();
  if ("res" in s) return s.res;

  const body = (await req.json().catch(() => null)) as
    | { canal_id?: number; texto?: string; parent_id?: number | null }
    | null;

  const canalId = Number(body?.canal_id);
  const texto = (body?.texto ?? "").trim();
  const tieneParent = body?.parent_id != null;
  const parentId = tieneParent ? Number(body?.parent_id) : null;

  if (!Number.isInteger(canalId) || canalId <= 0) {
    return NextResponse.json({ error: "Canal inválido." }, { status: 400 });
  }
  if (tieneParent && (!Number.isInteger(parentId as number) || (parentId as number) <= 0)) {
    return NextResponse.json({ error: "Mensaje padre inválido." }, { status: 400 });
  }
  if (!texto) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
  }
  if (texto.length > 2000) {
    return NextResponse.json({ error: "Máximo 2000 caracteres." }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // El canal debe existir.
  const { data: canal } = await sb
    .from("foro_canales")
    .select("id")
    .eq("id", canalId)
    .maybeSingle();
  if (!canal) {
    return NextResponse.json({ error: "El canal no existe." }, { status: 404 });
  }

  // Si es una respuesta: el padre debe existir, ser del mismo canal y ser PRINCIPAL
  // (parent_id null). No se puede responder a una respuesta. Validación server-side.
  if (tieneParent) {
    const { data: padre } = await sb
      .from("foro_mensajes")
      .select("id, canal_id, parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (!padre) {
      return NextResponse.json({ error: "El mensaje al que respondés no existe." }, { status: 404 });
    }
    if (Number(padre.canal_id) !== canalId) {
      return NextResponse.json({ error: "El mensaje padre pertenece a otro canal." }, { status: 400 });
    }
    if (padre.parent_id != null) {
      return NextResponse.json(
        { error: "No se puede responder a una respuesta (solo un nivel)." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await sb
    .from("foro_mensajes")
    .insert({
      canal_id: canalId,
      user_email: s.email,
      user_nombre: s.nombre,
      texto,
      parent_id: parentId,
    })
    .select("id, user_email, user_nombre, texto, creado, editado, parent_id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo publicar el mensaje." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mensaje: data });
}
