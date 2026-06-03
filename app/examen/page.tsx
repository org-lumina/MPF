import { redirect } from "next/navigation";
import { requerirAccesoVigente } from "@/lib/guard";
import { cargarExamenes, elegirExamenAleatorio } from "@/lib/examenes";
import { examenesCompletados } from "@/lib/progreso";
import RendirExamen from "@/components/RendirExamen";
import type { SanitExamen } from "@/lib/tipos";

export default async function ExamenPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; excluir?: string }>;
}) {
  const email = await requerirAccesoVigente();
  const { e, excluir } = await searchParams;

  const examenes = cargarExamenes();
  const ids = examenes.map((x) => x.examen_id);
  const completados = await examenesCompletados(email);

  // Si no viene un examen válido en la URL, sorteamos uno no completado
  // (excluyendo el actual si vienen de "Otro examen") y redirigimos con ?e=ID
  // para que el examen no cambie al recargar.
  const actual = e ? Number(e) : NaN;
  if (!ids.includes(actual)) {
    const excluidos = [...completados];
    const ex = excluir ? Number(excluir) : NaN;
    if (!Number.isNaN(ex)) excluidos.push(ex);
    const elegido = elegirExamenAleatorio(excluidos, { ids });
    redirect(`/examen?e=${elegido}`);
  }

  const examen = examenes.find((x) => x.examen_id === actual)!;
  const sanit: SanitExamen = {
    examen_id: examen.examen_id,
    preguntas: examen.preguntas.map((p) => ({
      id: p.id,
      tema: p.tema,
      enunciado: p.enunciado,
      opciones: p.opciones.map((o) => ({ letra: o.letra, texto: o.texto })),
    })),
    caso: {
      enunciado: examen.caso.enunciado,
      planteo: examen.caso.planteo,
      preguntas: examen.caso.preguntas,
      aclaracion: examen.caso.aclaracion,
    },
  };

  const restantes = ids.filter((id) => !completados.includes(id)).length;

  return <RendirExamen examen={sanit} restantes={restantes} />;
}
