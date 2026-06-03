import Link from "next/link";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";
import CtaAcceso from "@/components/CtaAcceso";

export default async function MpfJuridicoModos() {
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
        <p><Link href="/mpf" className="volver-inicio">← Agrupaciones</Link></p>
        <div className="sec-head">
          <h2 className="sec-title">Técnico Jurídico · elegí el <span className="mark">modo</span></h2>
          <p className="sec-sub">Dos formas de practicar para el ingreso jurídico.</p>
        </div>

        <div className="grid-2">
          <article className="card agr-card">
            <span className="agr-icon">📝</span>
            <h3 className="agr-name">Examen completo</h3>
            <p className="agr-desc">
              25 preguntas de opción múltiple + 1 caso práctico a resolver, con
              corrección y devolución por tema.
            </p>
            <CtaAcceso estado={estado} href="/examen" label="Empezar examen ▸" />
          </article>

          <article className="card agr-card">
            <span className="agr-icon">📚</span>
            <h3 className="agr-name">Solo casos a resolver</h3>
            <p className="agr-desc">
              +45 casos para resolver: cada uno con su planteo y 5 preguntas, más la
              resolución modelo al finalizar.
            </p>
            <CtaAcceso estado={estado} href="/casos" label="Empezar con casos ▸" />
          </article>
        </div>
      </div>
    </section>
  );
}
