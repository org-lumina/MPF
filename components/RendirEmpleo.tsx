"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SanitEmpleo, Letra } from "@/lib/tipos";

const TITULO: Record<SanitEmpleo["modulo"], string> = {
  administrativos: "Administrativos y Servicios Generales",
  profesionales: "Profesionales",
};

export default function RendirEmpleo({
  examen,
  modulo,
  restantes,
}: {
  examen: SanitEmpleo;
  modulo: SanitEmpleo["modulo"];
  restantes: number;
}) {
  const router = useRouter();
  const total = examen.preguntas.length; // 25
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<Record<number, Letra>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = examen.preguntas[idx];
  const respondidas = Object.keys(resp).length;
  const enUltima = idx === total - 1;
  const ruta = `/empleo/${modulo}`;

  async function finalizar() {
    setEnviando(true); setError(null);
    try {
      const res = await fetch(`/api/empleo/${modulo}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examen_id: examen.examen_id, respuestas: resp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo corregir el examen."); setEnviando(false); return; }
      sessionStorage.setItem("mpf_resultado", JSON.stringify(data));
      router.push("/resultado");
    } catch {
      setError("Error de red al finalizar."); setEnviando(false);
    }
  }

  return (
    <section className="panel">
      <div className="examen-top">
        <span>
          <Link href="/empleo" className="volver-inicio">← Empleo Público</Link>
          {"  ·  "}
          <strong>{TITULO[modulo]} — Examen N° {examen.examen_id}</strong>
        </span>
        <span className="examen-meta">
          {respondidas}/{total} respondidas · {restantes} sin hacer
          {" · "}
          <Link href={`${ruta}?excluir=${examen.examen_id}`}>Otro examen</Link>
        </span>
      </div>

      <div className="progress">
        Pregunta {idx + 1} de {total}
        <span className="progress-bar">
          <span className="progress-fill" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </span>
      </div>

      <p className="tema-chip">{p.tema}</p>

      {p.texto_base && (
        <blockquote className="texto-base" aria-label="Texto para leer">
          {p.texto_base}
        </blockquote>
      )}

      <h2 className="enunciado">{idx + 1}. {p.enunciado}</h2>

      <ul className="opciones">
        {p.opciones.map((o) => {
          const sel = resp[p.id] === o.letra;
          return (
            <li key={o.letra}>
              <label className={`opcion ${sel ? "opcion-sel" : ""}`}>
                <input
                  type="radio"
                  name={`q-${p.id}`}
                  checked={sel}
                  onChange={() => setResp((r) => ({ ...r, [p.id]: o.letra as Letra }))}
                />
                <span><strong>{o.letra})</strong> {o.texto}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="nav">
        <button type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          ← Anterior
        </button>
        {enUltima ? (
          <button type="button" className="cta" onClick={finalizar} disabled={!resp[p.id] || enviando}>
            {enviando ? "Corrigiendo…" : "Finalizar y ver resultados"}
          </button>
        ) : (
          <button type="button" className="cta" onClick={() => setIdx((i) => i + 1)} disabled={!resp[p.id]}>
            Siguiente →
          </button>
        )}
      </div>
      {error && <p style={{ color: "#c00", marginTop: "0.8rem" }}>{error}</p>}
    </section>
  );
}
