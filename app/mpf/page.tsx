import Link from "next/link";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";
import CtaAcceso from "@/components/CtaAcceso";

export default async function MpfAgrupaciones() {
  const session = await auth();
  const email = session?.user?.email;
  const conAcceso = email ? await tieneAccesoVigente(email) : false;
  const estado: "anon" | "sin-acceso" | "con-acceso" = !email
    ? "anon"
    : conAcceso
      ? "con-acceso"
      : "sin-acceso";

  return (
    <section className="sec">
      <div className="wrap">
        <p><Link href="/" className="volver-inicio">← Inicio</Link></p>
        <div className="sec-head">
          <h2 className="sec-title">Elegí tu <span className="mark">agrupación</span></h2>
          <p className="sec-sub">
            Simulador Ingreso Democrático MPF · dos agrupaciones, cada una con su examen.
          </p>
        </div>

        <div className="grid-2">
          <article className="card agr-card">
            <span className="agr-icon">⚖️</span>
            <h3 className="agr-name">Técnico Jurídico</h3>
            <ul className="agr-lista">
              <li>Examen completo: 25 preguntas + caso práctico</li>
              <li>Examen de casos penales a resolver</li>
            </ul>
            <Link href="/mpf/juridico" className="btn cta">Ver modos ▸</Link>
          </article>

          <article className="card agr-card">
            <span className="agr-icon">🗂️</span>
            <h3 className="agr-name">Técnico Administrativo</h3>
            <p className="agr-desc">
              20 preguntas de opción múltiple: historia argentina y latinoamericana,
              sistema constitucional y MPF, y cívica. Sin caso práctico.
            </p>
            <CtaAcceso estado={estado} href="/examen-administrativo" label="Empezar examen ▸" />
          </article>
        </div>
      </div>
    </section>
  );
}
