import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  cargarExamenes,
  corregirExamen,
  generarDevolucion,
  type Letra,
  type RespuestasUsuario,
} from "@/lib/examenes";
import { tieneAccesoVigente } from "@/lib/acceso";
import { registrarCompletado } from "@/lib/progreso";
import type { ResultadoExamenUI } from "@/lib/tipos";

// POST /api/examen/finalizar
// Corrige el examen en el servidor (la corrección NUNCA pasa por el cliente),
// registra el examen como completado y devuelve el resultado detallado.
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
  if (!body?.examen_id) {
    return NextResponse.json({ error: "Falta examen_id" }, { status: 400 });
  }

  const examen = cargarExamenes().find((x) => x.examen_id === Number(body.examen_id));
  if (!examen) return NextResponse.json({ error: "Examen inexistente" }, { status: 404 });

  // Normalizar claves de respuestas a número.
  const respuestas: RespuestasUsuario = {};
  for (const [k, v] of Object.entries(body.respuestas ?? {})) {
    respuestas[Number(k)] = v;
  }

  const correc = corregirExamen(respuestas, examen);

  // Registrar como completado (no bloquea el resultado si falla la DB).
  try {
    await registrarCompletado(email, examen.examen_id);
  } catch {
    // se ignora: el resultado se devuelve igual
  }

  const preguntas = examen.preguntas.map((p) => {
    const d = correc.detalle.find((x) => x.id === p.id);
    return {
      id: p.id,
      tema: p.tema,
      enunciado: p.enunciado,
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
    caso: {
      enunciado: examen.caso.enunciado,
      resolucion_didactica: examen.caso.resolucion_didactica,
      fundamento_normativo: examen.caso.fundamento_normativo,
      planteo: examen.caso.planteo,
      preguntas: examen.caso.preguntas,
    },
  };

  return NextResponse.json(payload);
}
