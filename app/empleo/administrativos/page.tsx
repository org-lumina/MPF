import { redirect } from "next/navigation";
import { requerirAccesoVigente } from "@/lib/guard";
import { cargarEmpleoAdmin, elegirExamenAleatorio } from "@/lib/examenes";
import { completadosEmpleoAdmin } from "@/lib/progreso";
import RendirEmpleo from "@/components/RendirEmpleo";
import type { SanitEmpleo } from "@/lib/tipos";

export default async function EmpleoAdministrativosPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; excluir?: string }>;
}) {
  const email = await requerirAccesoVigente();
  const { e, excluir } = await searchParams;

  const examenes = cargarEmpleoAdmin();
  const ids = examenes.map((x) => x.examen_id);
  const completados = await completadosEmpleoAdmin(email);

  const actual = e ? Number(e) : NaN;
  if (!ids.includes(actual)) {
    const excluidos = [...completados];
    const ex = excluir ? Number(excluir) : NaN;
    if (!Number.isNaN(ex)) excluidos.push(ex);
    const elegido = elegirExamenAleatorio(excluidos, { ids });
    redirect(`/empleo/administrativos?e=${elegido}`);
  }

  const examen = examenes.find((x) => x.examen_id === actual)!;
  const sanit: SanitEmpleo = {
    examen_id: examen.examen_id,
    modulo: "administrativos",
    preguntas: examen.preguntas.map((p) => ({
      id: p.id,
      tema: p.tema,
      enunciado: p.enunciado,
      texto_base: p.texto_base,
      opciones: p.opciones.map((o) => ({ letra: o.letra, texto: o.texto })),
    })),
  };
  const restantes = ids.filter((id) => !completados.includes(id)).length;

  return <RendirEmpleo examen={sanit} modulo="administrativos" restantes={restantes} />;
}
