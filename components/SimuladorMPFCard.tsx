import Link from "next/link";

export default function SimuladorMPFCard() {
  return (
    <article className="card card-featured">
      <div className="feat-top">
        <span className="feat-badge">
          <span className="dot" /> DISPONIBLE AHORA
        </span>
        <div className="feat-mascot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sarmiento.jpg" alt="" />
        </div>
        <div className="feat-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 6v34" stroke="#1C1B33" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 14h28" stroke="#1C1B33" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="9" r="3" fill="#FFD23F" stroke="#1C1B33" strokeWidth="2.4" />
            <path d="M10 14L5 26h10z" fill="#00B6BD" stroke="#1C1B33" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M38 14l-5 12h10z" fill="#FF5DA2" stroke="#1C1B33" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="16" y="38" width="16" height="5" rx="2" fill="#FFD23F" stroke="#1C1B33" strokeWidth="2.4" />
          </svg>
        </div>
        <p className="feat-kicker">Simulador estrella</p>
        <h3 className="feat-name">
          Ingreso Democrático
          <br />
          Ministerio Público Fiscal
        </h3>
        <p className="feat-desc">
          Dos agrupaciones: Técnico Jurídico y Técnico Administrativo. Elegí la tuya
          y arrancá la práctica.
        </p>
        <div className="feat-chips">
          <span className="chip">⚖️ Técnico Jurídico</span>
          <span className="chip">🗂️ Técnico Administrativo</span>
        </div>
      </div>
      <div className="feat-foot">
        <Link href="/mpf" className="btn btn-feat">Ver agrupaciones ▸</Link>
      </div>
    </article>
  );
}
