"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ResultadoExamenUI } from "@/lib/tipos";
import { descargarResultadoPDF } from "@/lib/pdfResultado";

const SIM_NAME = "Ingreso Democrático Ministerio Público Fiscal";

function animo(nota: number) {
  if (nota >= 7) return { emoji: "🎉", txt: "¡Excelente! Vas muy bien." };
  if (nota >= 4) return { emoji: "💪", txt: "Vas bien, seguí practicando." };
  return { emoji: "📚", txt: "A reforzar: dale otra vuelta a los temas." };
}
function colorPct(p: number) {
  if (p >= 70) return "#1a9b56";
  if (p >= 40) return "#E0A100";
  return "#c0392b";
}

// Dona SVG aciertos vs errores
function Dona({ aciertos, total }: { aciertos: number; total: number }) {
  const r = 54, cx = 70, cy = 70, C = 2 * Math.PI * r;
  const fracOK = total > 0 ? aciertos / total : 0;
  const okLen = C * fracOK;
  return (
    <svg viewBox="0 0 140 140" className="dona" role="img" aria-label={`${aciertos} de ${total} correctas`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FF5DA2" strokeWidth="18" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#00B6BD" strokeWidth="18"
        strokeDasharray={`${okLen} ${C - okLen}`} strokeDashoffset={C / 4}
        transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt"
      />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1C1B33" strokeWidth="2" opacity="0.25" />
      <text x={cx} y={cy - 2} textAnchor="middle" className="dona-num">{aciertos}/{total}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" className="dona-lbl">correctas</text>
    </svg>
  );
}

export default function ResultadoView() {
  const [r, setR] = useState<ResultadoExamenUI | null>(null);
  const [cargo, setCargo] = useState(false);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const bloqueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("mpf_resultado");
    if (s) {
      try { setR(JSON.parse(s) as ResultadoExamenUI); } catch { setR(null); }
    }
    setCargo(true);
  }, []);

  async function descargarPDF() {
    if (!r || !bloqueRef.current) return;
    setPdfMsg("Generando PDF…");
    try {
      await descargarResultadoPDF(bloqueRef.current, `resultado-examen-${r.examenId}.pdf`);
      setPdfMsg(null);
    } catch {
      setPdfMsg("No se pudo generar el PDF.");
    }
  }

  if (!cargo) return <section className="panel"><p>Cargando…</p></section>;
  if (!r) {
    return (
      <section className="panel">
        <h1>Resultados</h1>
        <p>No hay un resultado reciente. <Link href="/examen">Hacé un examen</Link>.</p>
        <p style={{ marginTop: "1rem" }}><Link href="/" className="volver-inicio">← Inicio</Link></p>
      </section>
    );
  }

  const a = animo(r.nota);
  const errores = r.total - r.aciertos;
  const temas = Object.entries(r.porTema);
  // Si el resultado tiene caso es el examen jurídico; si no, el administrativo.
  const volverHref = r.caso ? "/examen" : "/examen-administrativo";
  const volverLabel = "Hacer otro examen";

  return (
    <section className="panel">
      <p><Link href="/" className="volver-inicio">← Inicio</Link></p>
      <div ref={bloqueRef} className="bloque-resultados">
      <div data-pdf-block>
      <p className="res-kicker">{SIM_NAME}</p>
      <h1>Resultados — Examen N° {r.examenId}</h1>

      {/* Resumen visual */}
      <div className="res-resumen">
        <div className="res-nota-box">
          <div className="res-emoji">{a.emoji}</div>
          <div className="nota-grande">{r.nota.toFixed(2)} <span>/ 10</span></div>
          <div className="res-animo">{a.txt}</div>
        </div>
        <div className="res-dona-box">
          <Dona aciertos={r.aciertos} total={r.total} />
          <div className="dona-leyenda">
            <span><i className="sw" style={{ background: "#00B6BD" }} /> {r.aciertos} correctas</span>
            <span><i className="sw" style={{ background: "#FF5DA2" }} /> {errores} incorrectas</span>
          </div>
        </div>
      </div>

      {/* Desglose por tema (barras) */}
      <h2>Desglose por tema</h2>
      <p>{r.devolucion}</p>
      <div className="temas-bars">
        {temas.map(([tema, t]) => (
          <div className="tema-row" key={tema}>
            <div className="tema-lbl">{tema}</div>
            <div className="tema-track">
              <div className="tema-fill" style={{ width: `${t.porcentaje}%`, background: colorPct(t.porcentaje) }} />
            </div>
            <div className="tema-val">{t.aciertos}/{t.total} · {t.porcentaje}%</div>
          </div>
        ))}
      </div>

      {/* Repaso */}
      <h2>Repaso pregunta por pregunta</h2>
      </div>{/* /bloque encabezado */}
      {r.preguntas.map((p, i) => (
        <div key={p.id} className="repaso" data-pdf-block>
          <p className="tema-chip">{p.tema}</p>
          {p.texto_base && <blockquote className="texto-base">{p.texto_base}</blockquote>}
          <p><strong>{i + 1}. {p.enunciado}</strong></p>
          <ul className="opciones">
            {p.opciones.map((o) => {
              const esElegida = o.letra === p.elegida;
              const esCorrecta = o.letra === p.correcta;
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
          {!p.elegida && <p className="placeholder-note">No respondiste esta pregunta.</p>}
          {p.opciones.filter((o) => o.letra === p.correcta).map((o) => (
            <p key={o.letra} className="explicacion">{o.explicacion}</p>
          ))}
          {p.elegida && !p.acerto && p.opciones.filter((o) => o.letra === p.elegida).map((o) => (
            <p key={o.letra} className="explicacion explicacion-mal">Tu opción: {o.explicacion}</p>
          ))}
        </div>
      ))}

      {/* Caso (solo en el examen jurídico completo; el administrativo no tiene) */}
      {r.caso && (
        <div data-pdf-block>
          <h2>Caso práctico</h2>
          {r.caso.planteo ? (
            <>
              {r.caso.planteo.split("\n").filter((l) => l.trim()).map((ln, i) => (
                <p key={i} className="caso-planteo">{ln}</p>
              ))}
              {r.caso.preguntas && r.caso.preguntas.length > 0 && (
                <div className="caso-preguntas">
                  {r.caso.preguntas.map((q, i) => <p key={i}>{q}</p>)}
                </div>
              )}
            </>
          ) : (
            <p className="caso-enunciado">{r.caso.enunciado}</p>
          )}
          <h3>Resolución modelo</h3>
          {r.caso.resolucion_didactica.split("\n").filter((l) => l.trim()).map((ln, i) => {
            const m = ln.match(/^\s*(Pregunta\s*\d+\s*[:.)])(.*)$/);
            return <p key={i} className="reso-linea">{m ? (<><strong>{m[1]}</strong>{m[2]}</>) : ln}</p>;
          })}
          {r.caso.fundamento_normativo && (
            <p className="placeholder-note">Fundamento normativo: {r.caso.fundamento_normativo}</p>
          )}
        </div>
      )}
      </div>{/* /bloque-resultados (lo que captura el PDF visual) */}

      <div className="res-acciones">
        <button type="button" className="btn cta" onClick={descargarPDF}>⬇ Descargar resultado en PDF</button>
        <Link href={volverHref} className="btn btn-ghost btn-ghost-2">{volverLabel}</Link>
      </div>
      {pdfMsg && <p className="placeholder-note">{pdfMsg}</p>}
    </section>
  );
}
