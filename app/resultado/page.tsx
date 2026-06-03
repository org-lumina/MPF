import { requerirAccesoVigente } from "@/lib/guard";
import ResultadoView from "@/components/ResultadoView";

export default async function ResultadoPage() {
  // Mismo candado de servidor que /examen.
  await requerirAccesoVigente();
  return <ResultadoView />;
}
