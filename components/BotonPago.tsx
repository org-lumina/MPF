"use client";

import { useState } from "react";

export default function BotonPago() {
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
            : "No se pudo iniciar el pago. Probá de nuevo en un momento."
        );
        setLoading(false);
        return;
      }
      window.location.href = data.init_point as string;
    } catch {
      setError("Error de red al crear el pago.");
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="cta" onClick={pagar} disabled={loading}>
        {loading ? "Redirigiendo a Mercado Pago…" : "Pagar AR$5000"}
      </button>
      {error && <p style={{ color: "#c00", marginTop: "0.8rem" }}>{error}</p>}
    </>
  );
}
