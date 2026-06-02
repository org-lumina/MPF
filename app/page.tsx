import Link from "next/link";

export default function LandingPage() {
  return (
    <section>
      <h1>Práctica de exámenes para el Ministerio Público Fiscal</h1>
      <p>
        30 exámenes de opción múltiple con caso práctico, corrección automática
        y devolución por tema. Pago único para acceso libre a todos los
        exámenes.
      </p>
      <Link href="/login" className="cta">
        Comenzar
      </Link>
      <p className="placeholder-note">
        Esqueleto inicial: el flujo (login con Google → pago único AR$5000 vía
        Mercado Pago → exámenes) aún no tiene la lógica integrada.
      </p>
    </section>
  );
}
