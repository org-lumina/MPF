"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SanitExamen, Letra } from "@/lib/tipos";

export default function RendirExamen({
  examen,
  restantes,
}: {
  examen: SanitExamen;
  restantes: number;
}) {
  const router = useRouter();
  const total = examen.preguntas.length; // 25
  const [idx, setIdx] = useState(0); // 0..total-1 = preguntas; total = caso
  const [resp, setResp] = useState<Record<number, Letra>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enCaso = idx >= total;
  const respondidas = Object.keys(resp).length;

  function elegir(qid: number, letra: Letra) {
    setResp((r) => ({ ...r, [qid]: letra }));
  }

  async function finalizar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/examen/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examen_id: examen.examen_id, respuestas: resp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo corregir el examen.");
        setEnviando(false);
        return;
      }
      sessionStorage.setItem("mpf_resultado", JSON.stringify(data));
      router.push("/resultado");
    } catch {
      setError("Error de red al finalizar.");
      setEnviando(false);
    }
  }

  return (
    <section>
      <div className="examen-top">
        <strong>Examen N° {examen.examen_id}</strong>
        <span className="examen-meta">
          {respondidas}/{total} respondidas · {restantes} sin hacer
          {" · "}
          <a href={`/examen?excluir=${examen.examen_id}`}>Otro examen</a>
        </span>
      </div>

      {!enCaso ? (
        <>
          <div className="progress">
            Pregunta {idx + 1} de {total}
            <span className="progress-bar">
              <span
                className="progress-fill"
                style={{ width: `${((idx + 1) / total) * 100}%` }}
              />
            </span>
          </div>

          <p className="tema-chip">[{examen.preguntas[idx].tema}]</p>
          <h2 className="enunciado">
            {idx + 1}. {examen.preguntas[idx].enunciado}
          </h2>

          <ul className="opciones">
            {examen.preguntas[idx].opciones.map((o) => {
              const qid = examen.preguntas[idx].id;
              const sel = resp[qid] === o.letra;
              return (
                <li key={o.letra}>
                  <label className={`opcion ${sel ? "opcion-sel" : ""}`}>
                    <input
                      type="radio"
                      name={`q-${qid}`}
                      checked={sel}
                      onChange={() => elegir(qid, o.letra)}
                    />
                    <span>
                      <strong>{o.letra})</strong> {o.texto}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="nav">
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="cta"
              onClick={() => setIdx((i) => i + 1)}
              disabled={!resp[examen.preguntas[idx].id]}
            >
              {idx === total - 1 ? "Ver caso práctico →" : "Siguiente →"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="progress">Caso práctico</div>
          <h2 className="enunciado">Caso práctico</h2>

          {examen.caso.preguntas && examen.caso.preguntas.length > 0 ? (
            <>
              {(examen.caso.planteo ?? "")
                .split("\n")
                .filter((l) => l.trim())
                .map((ln, i) => (
                  <p key={i} className="caso-planteo">
                    {ln}
                  </p>
                ))}
              <div className="caso-preguntas">
                {examen.caso.preguntas.map((q, i) => (
                  <p key={i}>{q}</p>
                ))}
              </div>
              {examen.caso.aclaracion && (
                <p className="placeholder-note">{examen.caso.aclaracion}</p>
              )}
            </>
          ) : (
            <>
              <p>{examen.caso.enunciado}</p>
              <p className="placeholder-note">
                Pensá tu resolución: el caso <strong>no se califica</strong>. Verás
                la resolución modelo en los resultados.
              </p>
            </>
          )}

          <div className="nav">
            <button type="button" onClick={() => setIdx(total - 1)}>
              ← Volver a las preguntas
            </button>
            <button
              type="button"
              className="cta"
              onClick={finalizar}
              disabled={enviando}
            >
              {enviando ? "Corrigiendo…" : "Finalizar y ver resultados"}
            </button>
          </div>
          {respondidas < total && (
            <p className="placeholder-note">
              Respondiste {respondidas} de {total}. Las no respondidas cuentan como
              incorrectas.
            </p>
          )}
        </>
      )}

      {error && <p style={{ color: "#c00", marginTop: "0.8rem" }}>{error}</p>}
    </section>
  );
}
