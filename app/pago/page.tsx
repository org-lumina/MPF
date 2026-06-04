import Link from "next/link";
import { auth } from "@/auth";
import { obtenerAcceso } from "@/lib/acceso";
import BotonPago from "@/components/BotonPago";

const BENEFICIOS = [
  "Un solo pago, acceso completo a las dos agrupaciones: Técnico Jurídico y Técnico Administrativo.",
  "Técnico Jurídico: 30 exámenes (25 de opción múltiple + 1 caso práctico) y el modo “Solo casos” penales para resolver.",
  "Técnico Administrativo: 20 exámenes de opción múltiple (historia argentina y latinoamericana, sistema constitucional y MPF, cívica).",
  "Corrección automática con la explicación de cada respuesta citando la norma y el artículo.",
  "Devolución por tema con gráficos, descargable en PDF.",
  "Contenido basado en el material oficial del concurso.",
  "6 meses de acceso, con intentos ilimitados.",
];

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const session = await auth();
  const email = session?.user?.email;
  const acceso = email
    ? await obtenerAcceso(email)
    : { vigente: false, vence: null as Date | null };

  if (acceso.vigente && acceso.vence) {
    const hasta = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(acceso.vence);
    return (
      <section className="panel">
        <h1>¡Ya tenés acceso! 🎉</h1>
        <p>Tu acceso está activo hasta <strong>{hasta}</strong>.</p>
        <p style={{ marginTop: "1.2rem" }}>
          <Link href="/examen" className="cta">Hacer un examen</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="panel pago-panel">
      <p className="res-kicker">Acceso completo</p>
      <h1>Acceso completo · 6 meses</h1>

      {motivo === "acceso" && (
        <p className="aviso-acceso">Necesitás acceso para practicar los exámenes.</p>
      )}

      <div className="pago-precio">
        <span className="precio-num">$5000</span>
        <span className="precio-sub">pago único · 6 meses · todo incluido</span>
      </div>

      <h2>Qué incluye</h2>
      <ul className="pago-benes">
        {BENEFICIOS.map((b, i) => (
          <li key={i}>
            <span className="bene-check" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 13l5 5 11-12" stroke="#1C1B33" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="pago-cta">
        {!email ? (
          <p>
            Primero <Link href="/login?redirectTo=/pago" className="volver-inicio">iniciá sesión</Link> para activar tu acceso.
          </p>
        ) : (
          <BotonPago />
        )}
      </div>

      <p className="pago-nota">
        Pago único. El acceso dura 6 meses; al vencer, podés renovarlo. No es una
        suscripción automática. Después de pagar, tu acceso se activa al instante.
      </p>
    </section>
  );
}
