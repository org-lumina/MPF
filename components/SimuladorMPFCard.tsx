import Link from "next/link";

// Tarjeta activa de tamaño estándar (sin "card-featured": todas las tarjetas iguales).
export default function SimuladorMPFCard() {
  return (
    <article className="card card-sim sim-teal">
      <span className="sim-badge"><span className="dot" /> DISPONIBLE</span>
      <div className="sim-icon">
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M24 6v34" stroke="#1C1B33" strokeWidth="3" strokeLinecap="round" />
          <path d="M10 14h28" stroke="#1C1B33" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="9" r="3" fill="#FFD23F" stroke="#1C1B33" strokeWidth="2.4" />
          <path d="M10 14L5 26h10z" fill="#00B6BD" stroke="#1C1B33" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M38 14l-5 12h10z" fill="#FF5DA2" stroke="#1C1B33" strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="16" y="38" width="16" height="5" rx="2" fill="#FFD23F" stroke="#1C1B33" strokeWidth="2.4" />
        </svg>
      </div>
      <h3 className="sim-name">Ingreso Democrático — Ministerio Público Fiscal</h3>
      <p className="sim-desc">Dos agrupaciones: Técnico Jurídico y Técnico Administrativo.</p>
      <Link href="/mpf" className="btn btn-sim">Ver agrupaciones ▸</Link>
    </article>
  );
}
