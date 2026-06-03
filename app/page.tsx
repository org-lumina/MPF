import Link from "next/link";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";
import SimuladorMPFCard from "@/components/SimuladorMPFCard";
import PedidoExamenCard from "@/components/PedidoExamenCard";

export default async function HomeHub() {
  const session = await auth();
  const email = session?.user?.email;
  const conAcceso = email ? await tieneAccesoVigente(email) : false;

  // CTA inteligente: respeta login + acceso (gating actual).
  let ctaHref = "/login";
  let ctaLabel = "Primero vas a iniciar sesión con Google.";
  if (email && !conAcceso) {
    ctaHref = "/pago";
    ctaLabel = "Necesitás activar tu acceso (pago único, 6 meses) para practicar.";
  } else if (email && conAcceso) {
    ctaHref = "/examen";
    ctaLabel = "Tu acceso está activo. ¡A practicar!";
  }
  const estado: "anon" | "sin-acceso" | "con-acceso" = !email
    ? "anon"
    : conAcceso
      ? "con-acceso"
      : "sin-acceso";

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src="/facu.jpg" alt="Facultad de Derecho de la UBA, ilustración" />
            <div className="veil" />
            <div className="mascot mascot-alberdi">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/alberdi.jpg" alt="Alberdi" />
            </div>
            <div className="mascot-tag">¡Tomá las Bases! 📜</div>
            <div className="hero-sello" aria-label="Precio: $5000 por 6 meses, todo incluido">
              <span className="precio">$5000</span>
              <span className="sub">6 meses · todo incluido</span>
            </div>
            <div className="hero-inner">
              <span className="eyebrow">
                <span className="dot" /> Simuladores para preparar pruebas reales
              </span>
              <h1 className="hero-title">
                Entrená con <em>simulacros reales</em> y rendí tu examen tranqui.
              </h1>
              <p className="hero-sub">
                Practicá con simuladores que imitan las pruebas de verdad: mismo
                formato y opción múltiple, sin límite de tiempo. Llegás al examen
                sabiendo exactamente qué esperar.
              </p>
              <div className="hero-cta-row">
                <Link href="#simuladores" className="btn btn-lg btn-primary">
                  Empezar práctica ▸
                </Link>
                <Link href="#como" className="btn btn-lg btn-ghost">
                  Ver cómo funciona
                </Link>
              </div>
            </div>
          </div>

          <div className="strip">
            <span className="pill">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#FFD23F" stroke="#1C1B33" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              Formato idéntico al examen real
            </span>
            <span className="pill">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#00B6BD" stroke="#1C1B33" strokeWidth="1.8" /><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
              Sin límite de tiempo, a tu ritmo
            </span>
            <span className="pill">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 13l5 5 11-12" stroke="#FF5DA2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Corrección al instante
            </span>
          </div>
        </div>
      </section>

      {/* SIMULADORES */}
      <section className="sec" id="simuladores">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="sec-title">
              Elegí tu <span className="mark">simulador</span>
            </h2>
            <p className="sec-sub">
              Arrancamos con Ingreso Democrático Ministerio Público Fiscal. El hub crece todas las semanas 🚀
            </p>
          </div>

          <div className="grid">
            <SimuladorMPFCard ctaHref={ctaHref} ctaLabel={ctaLabel} estado={estado} />

            <article className="card card-soon">
              <span className="soon-ribbon">PRÓXIMAMENTE</span>
              <div className="soon-body">
                <div className="soon-icon">
                  <svg viewBox="0 0 36 36" fill="none"><path d="M5 28V14m7 14V9m7 19V16m7 12V6" stroke="#8A8472" strokeWidth="3" strokeLinecap="round" /><path d="M5 30h26" stroke="#8A8472" strokeWidth="3" strokeLinecap="round" /></svg>
                </div>
                <h3 className="soon-name">Comisión Nacional de Valores</h3>
                <span className="soon-meta">🔔 Avisame cuando esté</span>
              </div>
            </article>

            <article className="card card-soon">
              <span className="soon-ribbon">PRÓXIMAMENTE</span>
              <div className="soon-body">
                <div className="soon-icon">
                  <svg viewBox="0 0 36 36" fill="none"><rect x="6" y="9" width="24" height="20" rx="2" stroke="#8A8472" strokeWidth="3" /><path d="M13 9V6h10v3M6 17h24M18 17v12" stroke="#8A8472" strokeWidth="3" strokeLinecap="round" /></svg>
                </div>
                <h3 className="soon-name">Sistema Nacional de Empleo Público</h3>
                <span className="soon-meta">🔔 Avisame cuando esté</span>
              </div>
            </article>

            <article className="card card-soon">
              <span className="soon-ribbon">PRÓXIMAMENTE</span>
              <div className="soon-body">
                <div className="soon-icon">
                  <svg viewBox="0 0 36 36" fill="none"><path d="M18 5C9 5 5 13 5 19h26C31 13 27 5 18 5z" stroke="#8A8472" strokeWidth="3" strokeLinejoin="round" /><path d="M18 19v9a4 4 0 01-8 0" stroke="#8A8472" strokeWidth="3" strokeLinecap="round" /></svg>
                </div>
                <h3 className="soon-name">Productores de Seguros</h3>
                <span className="soon-meta">🔔 Avisame cuando esté</span>
              </div>
            </article>

            <PedidoExamenCard />
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="how" id="como">
        <div className="wrap">
          <h2 className="how-title">
            Tres pasos y estás <em>practicando</em>
          </h2>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <svg className="step-ic" viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="28" height="28" rx="7" fill="#00B6BD" stroke="#1C1B33" strokeWidth="2.6" /><path d="M14 20l4 4 8-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <h3>Elegí el simulador</h3>
              <p>Tocá el examen que querés preparar. Hoy: Ingreso Democrático Ministerio Público Fiscal.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <svg className="step-ic" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" fill="#FFD23F" stroke="#1C1B33" strokeWidth="2.6" /><path d="M20 12v8l5 3" stroke="#1C1B33" strokeWidth="3" strokeLinecap="round" /></svg>
              <h3>Rendí a tu ritmo</h3>
              <p>Mismo formato que la prueba real, sin límite de tiempo. Sin sorpresas el día del examen.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <svg className="step-ic" viewBox="0 0 40 40" fill="none"><path d="M8 28V18m8 10V10m8 18v-7m8 7V14" stroke="#FF5DA2" strokeWidth="3.4" strokeLinecap="round" /></svg>
              <h3>Mirá tu resultado</h3>
              <p>Corrección al toque y dónde fallaste, para volver más afilado.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
