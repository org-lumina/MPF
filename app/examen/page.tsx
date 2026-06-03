import { requerirAccesoVigente } from "@/lib/guard";

export default async function ExamenPage() {
  // Candado de servidor: sin login → /login; sin acceso vigente → /pago.
  const email = await requerirAccesoVigente();

  return (
    <section>
      <h1>Motor de examen</h1>
      <p className="placeholder-note">
        Acceso habilitado para <strong>{email}</strong>. Aquí se renderizará un
        examen (25 preguntas + 1 caso práctico) tomado de /data/examenes. La
        lógica de rendición/corrección vive en /lib (bloque posterior).
      </p>
    </section>
  );
}
