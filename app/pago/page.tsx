"use client";

import { useState } from "react";

export default function PagoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pago/crear", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        setError(
          data.error === "No autenticado"
            ? "Tenés que iniciar sesión antes de pagar."
            : data.error ?? "No se pudo iniciar el pago."
        );
        setLoading(false);
        return;
      }
      // Redirige al Checkout Pro de Mercado Pago.
      window.location.href = data.init_point as string;
    } catch {
      setError("Error de red al crear el pago.");
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Pago único (AR$5000) — acceso por 6 meses</h1>
      <p>
        Un solo pago habilita el acceso a los 30 exámenes durante 6 meses. Al
        vencer, se vuelve a pagar (no es una suscripción automática).
      </p>
      <button type="button" className="cta" onClick={pagar} disabled={loading}>
        {loading ? "Redirigiendo a Mercado Pago…" : "Pagar AR$5000"}
      </button>
      {error && (
        <p style={{ color: "#c00", marginTop: "0.8rem" }}>{error}</p>
      )}
      <p className="placeholder-note">
        Requiere MP_ACCESS_TOKEN en <code>.env.local</code>. Tras aprobar el
        pago, Mercado Pago redirige a <code>/examen</code> y notifica al webhook,
        que registra el acceso.
      </p>
    </section>
  );
}
