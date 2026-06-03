import { redirect } from "next/navigation";
import { requerirAccesoVigente } from "@/lib/guard";
import { cargarCasos, elegirExamenAleatorio } from "@/lib/examenes";
import { completadosCasos } from "@/lib/progreso";
import RendirCaso from "@/components/RendirCaso";
import type { SanitCaso } from "@/lib/tipos";

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; excluir?: string }>;
}) {
  const email = await requerirAccesoVigente();
  const { c, excluir } = await searchParams;

  const casos = cargarCasos();
  const ids = casos.map((x) => x.caso_id); // archivos presentes (tolera huecos)
  const completados = await completadosCasos(email);

  const actual = c ? Number(c) : NaN;
  if (!ids.includes(actual)) {
    const excluidos = [...completados];
    const ex = excluir ? Number(excluir) : NaN;
    if (!Number.isNaN(ex)) excluidos.push(ex);
    const elegido = elegirExamenAleatorio(excluidos, { ids });
    redirect(`/casos?c=${elegido}`);
  }

  const caso = casos.find((x) => x.caso_id === actual)!;
  const sanit: SanitCaso = {
    caso_id: caso.caso_id,
    planteo: caso.planteo,
    preguntas: caso.preguntas.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      opciones: p.opciones.map((o) => ({ letra: o.letra, texto: o.texto })),
    })),
  };
  const restantes = ids.filter((id) => !completados.includes(id)).length;

  return <RendirCaso caso={sanit} restantes={restantes} />;
}
