"use client";

import { useState } from "react";

const MAX = 300;

export default function PedidoExamenCard() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [examen, setExamen] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  function cerrar() {
    setOpen(false);
    setError(null);
    if (estado === "ok") {
      setNombre("");
      setExamen("");
      setEstado("idle");
    }
  }

  async function enviar() {
    setError(null);
    if (!nombre.trim()) { setError("Ingresá tu nombre y apellido."); return; }
    if (!examen.trim()) { setError("Contanos qué examen te gustaría."); return; }
    if (examen.length > MAX) { setError(`Máximo ${MAX} caracteres.`); return; }
    setEstado("enviando");
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_apellido: nombre, examen_pedido: examen }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo enviar el pedido."); setEstado("idle"); return; }
      setEstado("ok");
    } catch {
      setError("Error de red al enviar.");
      setEstado("idle");
    }
  }

  return (
    <>
      <article
        className="card card-suggest"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
        style={{ cursor: "pointer" }}
      >
        <span className="sug-plus">+</span>
        <div className="sug-title">¿Falta tu examen?</div>
        <div className="sug-sub">Pedinos el simulador que necesitás</div>
      </article>

      {open && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pedido-titulo"
          onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
        >
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={cerrar}>✕</button>
            <p className="modal-kicker">Sugerencias</p>
            <h2 id="pedido-titulo">¿Falta tu examen?</h2>

            {estado === "ok" ? (
              <>
                <p>🎉 ¡Gracias! Tu pedido fue registrado. Lo tendremos en cuenta para sumar nuevos simuladores.</p>
                <div className="modal-actions">
                  <button type="button" className="btn cta" onClick={cerrar}>Listo</button>
                </div>
              </>
            ) : (
              <>
                <p>Decinos qué simulador necesitás y lo sumamos al hub.</p>

                <div className="form-field">
                  <label htmlFor="pe-nombre">Nombre y apellido</label>
                  <input
                    id="pe-nombre"
                    type="text"
                    value={nombre}
                    maxLength={200}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej.: Agustín Pérez"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pe-examen">¿Qué examen te gustaría?</label>
                  <textarea
                    id="pe-examen"
                    value={examen}
                    maxLength={MAX}
                    rows={4}
                    onChange={(e) => setExamen(e.target.value)}
                    placeholder="Ej.: Ingreso a la AFIP, Escribanía, Poder Judicial de la Provincia…"
                  />
                  <div className="char-count">{examen.length}/{MAX}</div>
                </div>

                {error && <p className="form-msg-err">{error}</p>}

                <div className="modal-actions">
                  <button type="button" className="btn cta" onClick={enviar} disabled={estado === "enviando"}>
                    {estado === "enviando" ? "Enviando…" : "Enviar pedido"}
                  </button>
                  <button type="button" className="btn btn-ghost btn-ghost-2" onClick={cerrar}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
