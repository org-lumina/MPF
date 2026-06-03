"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { SanitCaso, ResultadoCasoUI, Letra } from "@/lib/tipos";
import { descargarResultadoPDF } from "@/lib/pdfResultado";

export default function RendirCaso({
  caso,
  restantes,
}: {
  caso: SanitCaso;
  restantes: number;
}) {
  const total = caso.preguntas.length; // 5
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<Record<number, Letra>>({});
  const [res, setRes] = useState<ResultadoCasoUI | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const bloqueRef = useRef<HTMLDivElement>(null);

  async function descargarPDF() {
    if (!res || !bloqueRef.current) return;
    setPdfMsg("Generando PDF…");
    try {
      await descargarResultadoPDF(bloqueRef.current, `resultado-caso-${res.casoId}.pdf`);
      setPdfMsg(null);
    } catch {
      setPdfMsg("No se pudo generar el PDF.");
    }
  }

  const p = caso.preguntas[idx];
  const respondidas = Object.keys(resp).length;
  const enUltima = idx === total - 1;

  async function finalizar() {
    setEnviando(true); setError(null);
    try {
      const r = await fetch("/api/casos/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caso_id: caso.caso_id, respuestas: resp }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "No se pudo corregir el caso."); setEnviando(false); return; }
      setRes(data as ResultadoCasoUI);
    } catch {
      setError("Error de red al finalizar."); setEnviando(false);
    }
  }

  // ---------- DEVOLUCIÓN ----------
  if (res) {
    // Resolución segmentada por "Pregunta N:" (presentación; no se inventa contenido)
    const segmentos = res.resolucion_didactica
      .split(/(?=Pregunta\s*\d+\s*[:.)])/)
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <section className="panel">
        <p>
          <Link href="/" className="volver-inicio">← Inicio</Link>
          {"  ·  "}
          <Link href="/mpf/juridico" className="volver-inicio">← Volver a modos</Link>
        </p>

        <div ref={bloqueRef} className="bloque-resultados">
          <div data-pdf-block>
          <p className="res-kicker">Solo casos · Caso N° {res.casoId}</p>
          <h1>Devolución del caso</h1>
          <p className="nota-grande">{res.aciertos}/{res.total} <span>correctas</span></p>

          {/* Esquema sinóptico (armado con datos del propio caso) */}
          <div className="esquema-caso">
            <div className="esquema-fila"><span className="esquema-rot">Eje</span><span>{res.eje ?? "Penal / Procesal"}</span></div>
            <div className="esquema-fila"><span className="esquema-rot">Hechos</span><span>{res.planteo}</span></div>
            <div className="esquema-fila"><span className="esquema-rot">Resultado</span><span>{res.aciertos} de {res.total} respuestas correctas</span></div>
          </div>

          <h2>Repaso de las preguntas</h2>
          </div>{/* /encabezado */}
          {res.preguntas.map((q, i) => (
            <div key={q.id} className="repaso" data-pdf-block>
              <p><strong>{i + 1}. {q.enunciado}</strong></p>
              <ul className="opciones">
                {q.opciones.map((o) => {
                  const esElegida = o.letra === q.elegida;
                  const esCorrecta = o.letra === q.correcta;
                  const cls = esCorrecta ? "op-correcta" : esElegida ? "op-incorrecta" : "";
                  return (
                    <li key={o.letra} className={`op-result ${cls}`}>
                      <strong>{o.letra})</strong> {o.texto}
                      {esCorrecta && " ✓"}
                      {esElegida && !esCorrecta && " ✗ (tu respuesta)"}
                      {esElegida && esCorrecta && " (tu respuesta)"}
                    </li>
                  );
                })}
              </ul>
              {q.opciones.filter((o) => o.letra === q.correcta).map((o) => (
                <p key={o.letra} className="explicacion">{o.explicacion}</p>
              ))}
              {q.elegida && !q.acerto && q.opciones.filter((o) => o.letra === q.elegida).map((o) => (
                <p key={o.letra} className="explicacion explicacion-mal">Tu opción: {o.explicacion}</p>
              ))}
            </div>
          ))}

          <div data-pdf-block data-pdf-pagebreak-before><h2>Resolución del caso · paso a paso</h2></div>
          <div className="reso-cards">
            {segmentos.map((seg, i) => {
              const m = seg.match(/^(Pregunta\s*\d+\s*[:.)])([\s\S]*)$/);
              return (
                <div key={i} className="reso-card" data-pdf-block>
                  {m ? (<><strong className="reso-card-tit">{m[1]}</strong> {m[2].trim()}</>) : seg}
                </div>
              );
            })}
          </div>
          {res.fundamento_normativo && (
            <div data-pdf-block><p className="placeholder-note">Fundamento normativo: {res.fundamento_normativo}</p></div>
          )}
        </div>{/* /bloque-resultados */}

        <div className="res-acciones">
          <button type="button" className="btn cta" onClick={descargarPDF}>⬇ Descargar resultado en PDF</button>
          <Link href={`/casos?excluir=${res.casoId}`} className="btn btn-ghost btn-ghost-2">Otro caso ▸</Link>
        </div>
        {pdfMsg && <p className="placeholder-note">{pdfMsg}</p>}
      </section>
    );
  }

  // ---------- RENDICIÓN ----------
  return (
    <section className="panel">
      <div className="examen-top">
        <span>
          <Link href="/mpf/juridico" className="volver-inicio">← Volver</Link>
          {"  ·  "}
          <strong>Solo casos — Caso N° {caso.caso_id}</strong>
        </span>
        <span className="examen-meta">
          {respondidas}/{total} · {restantes} sin hacer
          {" · "}
          <Link href={`/casos?excluir=${caso.caso_id}`}>Otro caso</Link>
        </span>
      </div>

      {/* Planteo SIEMPRE visible arriba */}
      <div className="caso-fijo">
        <h2>Caso práctico</h2>
        {caso.planteo.split("\n").filter((l) => l.trim()).map((ln, i) => (
          <p key={i} className="caso-planteo">{ln}</p>
        ))}
      </div>

      <div className="progress">
        Pregunta {idx + 1} de {total}
        <span className="progress-bar">
          <span className="progress-fill" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </span>
      </div>

      <h3 className="enunciado">{idx + 1}. {p.enunciado}</h3>
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
            {enviando ? "Corrigiendo…" : "Finalizar y ver devolución"}
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
