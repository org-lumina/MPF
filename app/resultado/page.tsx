import { requerirAccesoVigente } from "@/lib/guard";

export default async function ResultadoPage() {
  // Mismo candado de servidor que /examen.
  await requerirAccesoVigente();

  return (
    <section>
      <h1>Resultado y devolución</h1>
      <p className="placeholder-note">
        Aquí se mostrará la nota /10, el detalle de correctas e incorrectas, el
        desglose por tema y la resolución didáctica del caso práctico (que no se
        califica). La lógica vive en /lib (bloque posterior).
      </p>
    </section>
  );
}
