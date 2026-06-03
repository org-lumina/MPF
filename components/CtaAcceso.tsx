"use client";

import { useState } from "react";
import Link from "next/link";
import BotonPago from "@/components/BotonPago";

/**
 * CTA que respeta el gating como UX:
 * - con acceso  → Link al destino (examen).
 * - anónimo     → Link a /login.
 * - sin acceso  → modal de pago nublado (el gating server-side igual bloquea por URL).
 */
export default function CtaAcceso({
  estado,
  href,
  label,
  className = "btn cta",
}: {
  estado: "anon" | "sin-acceso" | "con-acceso";
  href: string;
  label: string;
  className?: string;
}) {
  const [pay, setPay] = useState(false);

  if (estado === "con-acceso") return <Link href={href} className={className}>{label}</Link>;
  if (estado === "anon") return <Link href="/login" className={className}>{label}</Link>;

  return (
    <>
      <button type="button" className={className} onClick={() => setPay(true)}>{label}</button>
      {pay && (
        <div
          className="modal-overlay blur"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setPay(false); }}
        >
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setPay(false)}>✕</button>
            <p className="modal-kicker">Acceso a los simuladores</p>
            <h2>Activá tu acceso para practicar</h2>
            <p>Para rendir los exámenes necesitás acceso vigente.</p>
            <div className="precio-modal">
              <span className="precio-num">$5000</span>
              <span className="precio-sub">6 meses · todo incluido</span>
            </div>
            <div className="modal-actions">
              <BotonPago />
              <button type="button" className="btn btn-ghost btn-ghost-2" onClick={() => setPay(false)}>Ahora no</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
