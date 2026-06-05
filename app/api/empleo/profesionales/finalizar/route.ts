import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  cargarEmpleoProf,
  corregirExamen,
  generarDevolucion,
  type Letra,
  type RespuestasUsuario,
} from "@/lib/examenes";
import { tieneAccesoVigente } from "@/lib/acceso";
import { registrarEmpleoProfCompletado } from "@/lib/progreso";
import type { ResultadoExamenUI } from "@/lib/tipos";

// POST /api/empleo/profesionales/finalizar — corrige (server) + registra + devuelve.
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!(await tieneAccesoVigente(email))) {
    return NextResponse.json({ error: "Sin acceso vigente" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { examen_id?: number; respuestas?: Record<string, Letra> }
    | null;
  if (!body?.examen_id) return NextResponse.json({ error: "Falta examen_id" }, { status: 400 });

  const examen = cargarEmpleoProf().find((x) => x.examen_id === Number(body.examen_id));
  if (!examen) return NextResponse.json({ error: "Examen inexistente" }, { status: 404 });

  const respuestas: RespuestasUsuario = {};
  for (const [k, v] of Object.entries(body.respuestas ?? {})) respuestas[Number(k)] = v;

  const correc = corregirExamen(respuestas, examen);
  try { await registrarEmpleoProfCompletado(email, examen.examen_id); } catch {}

  const preguntas = examen.preguntas.map((p) => {
    const d = correc.detalle.find((x) => x.id === p.id);
    return {
      id: p.id,
      tema: p.tema,
      enunciado: p.enunciado,
      texto_base: p.texto_base,
      opciones: p.opciones,
      elegida: d?.letraElegida ?? null,
      correcta: d?.letraCorrecta ?? null,
      acerto: d?.acerto ?? false,
    };
  });

  const payload: ResultadoExamenUI = {
    examenId: correc.examenId,
    nota: correc.nota,
    aciertos: correc.aciertos,
    total: correc.total,
    porTema: correc.porTema,
    devolucion: generarDevolucion(correc.porTema),
    preguntas,
  };

  return NextResponse.json(payload);
}
