import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cargarCasos, type Letra } from "@/lib/examenes";
import { tieneAccesoVigente } from "@/lib/acceso";
import { registrarCasoCompletado } from "@/lib/progreso";
import type { ResultadoCasoUI } from "@/lib/tipos";

// POST /api/casos/finalizar — corrige las 5 preguntas (server) + registra + devuelve.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!(await tieneAccesoVigente(email))) {
    return NextResponse.json({ error: "Sin acceso vigente" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { caso_id?: number; respuestas?: Record<string, Letra> }
    | null;
  if (!body?.caso_id) return NextResponse.json({ error: "Falta caso_id" }, { status: 400 });

  const caso = cargarCasos().find((x) => x.caso_id === Number(body.caso_id));
  if (!caso) return NextResponse.json({ error: "Caso inexistente" }, { status: 404 });

  const respuestas: Record<number, Letra> = {};
  for (const [k, v] of Object.entries(body.respuestas ?? {})) respuestas[Number(k)] = v;

  let aciertos = 0;
  const preguntas = caso.preguntas.map((p) => {
    const correcta = (p.opciones.find((o) => o.correcta)?.letra ?? null) as Letra | null;
    const elegida = respuestas[p.id] ?? null;
    const acerto = correcta !== null && elegida === correcta;
    if (acerto) aciertos++;
    return {
      id: p.id,
      tema: "Caso práctico",
      enunciado: p.enunciado,
      opciones: p.opciones,
      elegida,
      correcta,
      acerto,
    };
  });

  try { await registrarCasoCompletado(email, caso.caso_id); } catch {}

  const payload: ResultadoCasoUI = {
    casoId: caso.caso_id,
    eje: caso.eje,
    aciertos,
    total: caso.preguntas.length,
    planteo: caso.planteo,
    resolucion_didactica: caso.resolucion_didactica,
    preguntas,
  };
  return NextResponse.json(payload);
}
