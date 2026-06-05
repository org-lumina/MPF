import Link from "next/link";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";
import CtaAcceso from "@/components/CtaAcceso";

export default async function EmpleoAgrupaciones() {
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
          <h2 className="sec-title">Sistema Nacional de <span className="mark">Empleo Público</span></h2>
          <p className="sec-sub">
            Dos módulos según el perfil del cargo. Cada uno con su examen de 25 preguntas.
          </p>
        </div>

        <div className="grid-2">
          <article className="card agr-card">
            <span className="agr-icon">🗂️</span>
            <h3 className="agr-name">Administrativos y Servicios Generales</h3>
            <p className="agr-desc">
              Evaluación de dos ejes: Comprensión Lectora y Razonamiento Lógico-Matemático.
              25 preguntas de opción múltiple, sin caso práctico.
            </p>
            <CtaAcceso estado={estado} href="/empleo/administrativos" label="Empezar examen ▸" />
          </article>

          <article className="card agr-card">
            <span className="agr-icon">🎓</span>
            <h3 className="agr-name">Profesionales</h3>
            <p className="agr-desc">
              Evaluación de tres ejes: Comprensión Lectora, Razonamiento Lógico-Matemático
              y Administración Pública Nacional. 25 preguntas de opción múltiple.
            </p>
            <CtaAcceso estado={estado} href="/empleo/profesionales" label="Empezar examen ▸" />
          </article>
        </div>
      </div>
    </section>
  );
}
