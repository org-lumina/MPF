import { auth } from "@/auth";
import { obtenerAcceso } from "@/lib/acceso";
import BotonPago from "@/components/BotonPago";

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

  // Ya tiene acceso vigente: no mostramos el botón de pago.
  if (acceso.vigente && acceso.vence) {
    const hasta = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
      acceso.vence
    );
    return (
      <section>
        <h1>Pago</h1>
        <p>
          Ya tenés acceso hasta <strong>{hasta}</strong>.
        </p>
        <a href="/examen" className="cta">
          Hacer un examen
        </a>
      </section>
    );
  }

  return (
    <section>
      <h1>Pago único (AR$5000) — acceso por 6 meses</h1>

      {motivo === "acceso" && (
        <p style={{ color: "#b35900", fontWeight: 600 }}>
          Necesitás acceso para hacer los exámenes.
        </p>
      )}

      <p>
        Un solo pago habilita el acceso a los 30 exámenes durante 6 meses. Al
        vencer, se vuelve a pagar (no es una suscripción automática).
      </p>

      {!email ? (
        <p>
          Primero <a href="/login">iniciá sesión</a> para poder pagar.
        </p>
      ) : (
        <BotonPago />
      )}

      <p className="placeholder-note">
        Tras aprobar el pago, Mercado Pago redirige a <code>/examen</code> y
        notifica al webhook, que registra el acceso por 6 meses.
      </p>
    </section>
  );
}
