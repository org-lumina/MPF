"use client";

import { useState } from "react";
import Link from "next/link";
import BotonPago from "@/components/BotonPago";

export default function SimuladorMPFCard({
  ctaHref,
  ctaLabel,
  estado,
}: {
  ctaHref: string;
  ctaLabel: string;
  estado: "anon" | "sin-acceso" | "con-acceso";
}) {
  const [open, setOpen] = useState(false); // modal informativo
  const [pay, setPay] = useState(false); // modal de pago (nublado)

  return (
    <>
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
            Elegí el modo: opción múltiple o solo casos a resolver.
          </p>
          <div className="feat-chips">
            <span className="chip">📝 Opción múltiple</span>
            <span className="chip">🧘 A tu ritmo</span>
            <span className="chip">🔁 Reintentos ilimitados</span>
          </div>
        </div>
        <div className="feat-foot">
          <button type="button" className="btn btn-feat" onClick={() => setOpen(true)}>
            Empezar práctica ▸
          </button>
        </div>
      </article>

      {/* Modal informativo */}
      {open && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setOpen(false)}>✕</button>
            <p className="modal-kicker">Simulador · Ingreso Democrático Ministerio Público Fiscal</p>
            <h2 id="modal-titulo">Técnico Agrupación Jurídico</h2>
            <p>
              El examen real es una <strong>prueba de oposición de tenor jurídico</strong>:
              evalúa el manejo de las Bases, el derecho constitucional y la normativa del MPF.
            </p>
            <ul>
              <li>
                Las preguntas de <strong>opción múltiple</strong> te sirven para afianzar
                conocimientos y reconocer el formato.
              </li>
              <li>
                Al finalizar, se plantea un <strong>caso real para resolver</strong>, con su
                resolución modelo para que contrastes tu razonamiento.
              </li>
            </ul>
            <div className="modal-actions">
              {estado === "sin-acceso" ? (
                <button
                  type="button"
                  className="btn cta"
                  onClick={() => { setOpen(false); setPay(true); }}
                >
                  Comenzar ▸
                </button>
              ) : (
                <Link href={ctaHref} className="btn cta">
                  Comenzar ▸
                </Link>
              )}
              <button type="button" className="btn btn-ghost btn-ghost-2" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
            <p className="placeholder-note" style={{ marginTop: "10px" }}>{ctaLabel}</p>
          </div>
        </div>
      )}

      {/* Modal de pago con fondo nublado (logueado sin acceso) */}
      {pay && (
        <div
          className="modal-overlay blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-titulo"
          onClick={(e) => { if (e.target === e.currentTarget) setPay(false); }}
        >
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setPay(false)}>✕</button>
            <p className="modal-kicker">Acceso a los simuladores</p>
            <h2 id="pay-titulo">Activá tu acceso para practicar</h2>
            <p>Para rendir los exámenes necesitás acceso vigente.</p>
            <div className="precio-modal">
              <span className="precio-num">$5000</span>
              <span className="precio-sub">6 meses · todo incluido</span>
            </div>
            <div className="modal-actions">
              <BotonPago />
              <button type="button" className="btn btn-ghost btn-ghost-2" onClick={() => setPay(false)}>
                Ahora no
              </button>
            </div>
            <p className="placeholder-note" style={{ marginTop: "10px" }}>
              Pagás con Mercado Pago. Al aprobarse el pago se habilita el acceso por 6 meses.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
