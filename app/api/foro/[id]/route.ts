import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requerirAccesoApi } from "@/lib/foro";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/foro/[id]  → editar un mensaje. SOLO el autor (admin NO edita ajeno).
export async function PATCH(req: Request, { params }: Ctx) {
  const s = await requerirAccesoApi();
  if ("res" in s) return s.res;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { texto?: string } | null;
  const texto = (body?.texto ?? "").trim();
  if (!texto) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
  }
  if (texto.length > 2000) {
    return NextResponse.json({ error: "Máximo 2000 caracteres." }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Releer el mensaje desde la DB para validar autoría en el servidor.
  const { data: msg } = await sb
    .from("foro_mensajes")
    .select("id, user_email")
    .eq("id", id)
    .maybeSingle();
  if (!msg) {
    return NextResponse.json({ error: "El mensaje no existe." }, { status: 404 });
  }
  if ((msg.user_email as string) !== s.email) {
    return NextResponse.json({ error: "Solo podés editar tus propios mensajes." }, { status: 403 });
  }

  const { data, error } = await sb
    .from("foro_mensajes")
    .update({ texto, editado: new Date().toISOString() })
    .eq("id", id)
    .select("id, user_email, user_nombre, texto, creado, editado")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo editar el mensaje." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mensaje: data });
}

// DELETE /api/foro/[id]  → borrar. El autor borra lo suyo; el admin borra cualquiera.
export async function DELETE(_req: Request, { params }: Ctx) {
  const s = await requerirAccesoApi();
  if ("res" in s) return s.res;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: msg } = await sb
    .from("foro_mensajes")
    .select("id, user_email")
    .eq("id", id)
    .maybeSingle();
  if (!msg) {
    return NextResponse.json({ error: "El mensaje no existe." }, { status: 404 });
  }

  const esAutor = (msg.user_email as string) === s.email;
  if (!esAutor && !s.admin) {
    return NextResponse.json({ error: "No tenés permiso para borrar este mensaje." }, { status: 403 });
  }

  const { error } = await sb.from("foro_mensajes").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "No se pudo borrar el mensaje." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
