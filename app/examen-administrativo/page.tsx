import { redirect } from "next/navigation";
import { requerirAccesoVigente } from "@/lib/guard";
import { cargarAdministrativos, elegirExamenAleatorio } from "@/lib/examenes";
import { completadosAdmin } from "@/lib/progreso";
import RendirAdministrativo from "@/components/RendirAdministrativo";
import type { SanitAdmin } from "@/lib/tipos";

export default async function ExamenAdministrativoPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; excluir?: string }>;
}) {
  const email = await requerirAccesoVigente();
  const { e, excluir } = await searchParams;

  const examenes = cargarAdministrativos();
  const ids = examenes.map((x) => x.examen_id);
  const completados = await completadosAdmin(email);

  const actual = e ? Number(e) : NaN;
  if (!ids.includes(actual)) {
    const excluidos = [...completados];
    const ex = excluir ? Number(excluir) : NaN;
    if (!Number.isNaN(ex)) excluidos.push(ex);
    const elegido = elegirExamenAleatorio(excluidos, { ids });
    redirect(`/examen-administrativo?e=${elegido}`);
  }

  const examen = examenes.find((x) => x.examen_id === actual)!;
  const sanit: SanitAdmin = {
    examen_id: examen.examen_id,
    preguntas: examen.preguntas.map((p) => ({
      id: p.id,
      tema: p.tema,
      enunciado: p.enunciado,
      opciones: p.opciones.map((o) => ({ letra: o.letra, texto: o.texto })),
    })),
  };
  const restantes = ids.filter((id) => !completados.includes(id)).length;

  return <RendirAdministrativo examen={sanit} restantes={restantes} />;
}
