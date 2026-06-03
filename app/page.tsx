import Link from "next/link";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";

export default async function LandingPage() {
  const session = await auth();
  const email = session?.user?.email;
  const conAcceso = email ? await tieneAccesoVigente(email) : false;

  // CTA inteligente según el estado del usuario.
  let cta: { href: string; label: string };
  if (!email) cta = { href: "/login", label: "Ingresar" };
  else if (!conAcceso) cta = { href: "/pago", label: "Pagar y acceder" };
  else cta = { href: "/examen", label: "Hacer un examen" };

  return (
    <section>
      <h1>Práctica de exámenes para el Ministerio Público Fiscal</h1>
      <p>
        30 exámenes de opción múltiple con caso práctico, corrección automática
        y devolución por tema. Pago único que habilita el acceso por 6 meses.
      </p>

      <Link href={cta.href} className="cta">
        {cta.label}
      </Link>

      {email && !conAcceso && (
        <p className="placeholder-note">
          Iniciaste sesión como {email}, pero todavía no tenés acceso vigente.
        </p>
      )}
      {email && conAcceso && (
        <p className="placeholder-note">Sesión activa con acceso vigente: {email}.</p>
      )}
    </section>
  );
}
