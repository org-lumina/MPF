"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResultadoExamenUI } from "@/lib/tipos";

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

  useEffect(() => {
    const s = sessionStorage.getItem("mpf_resultado");
    if (s) {
      try { setR(JSON.parse(s) as ResultadoExamenUI); } catch { setR(null); }
    }
    setCargo(true);
  }, []);

  async function descargarPDF() {
    if (!r) return;
    setPdfMsg("Generando PDF…");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const M = 40, W = doc.internal.pageSize.getWidth() - M * 2;
      const Hpage = doc.internal.pageSize.getHeight();
      let y = M;
      const fecha = new Date().toLocaleDateString("es-AR");
      const line = (txt: string, size = 10, bold = false, gap = 4) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        for (const ln of doc.splitTextToSize(txt, W) as string[]) {
          if (y > Hpage - M) { doc.addPage(); y = M; }
          doc.text(ln, M, y); y += size + gap;
        }
      };
      line(SIM_NAME, 15, true, 6);
      line(`Examen N° ${r.examenId}  ·  Fecha: ${fecha}`, 10, false, 6);
      line(`Nota: ${r.nota.toFixed(2)} / 10   (${r.aciertos} de ${r.total} correctas)`, 13, true, 10);

      line("Desglose por tema", 12, true, 6);
      for (const [tema, t] of Object.entries(r.porTema)) {
        const est = t.porcentaje >= 70 ? "domina" : t.porcentaje >= 40 ? "a afianzar" : "reforzar";
        line(`• ${tema}: ${t.aciertos}/${t.total} (${t.porcentaje}%) — ${est}`, 10, false, 3);
      }
      y += 6;
      line("Repaso pregunta por pregunta", 12, true, 6);
      r.preguntas.forEach((p, i) => {
        line(`${i + 1}. ${p.enunciado}`, 10, true, 2);
        const eleg = p.opciones.find((o) => o.letra === p.elegida);
        const corr = p.opciones.find((o) => o.letra === p.correcta);
        line(`Tu respuesta: ${eleg ? `${eleg.letra}) ${eleg.texto}` : "(sin responder)"} — ${p.acerto ? "CORRECTA ✓" : "INCORRECTA ✗"}`, 10, false, 2);
        if (corr) line(`Correcta: ${corr.letra}) ${corr.texto}`, 10, false, 2);
        if (corr) line(`Explicación: ${corr.explicacion}`, 9, false, 6);
      });
      y += 6;
      line("Caso práctico", 12, true, 6);
      line(r.caso.planteo || r.caso.enunciado, 10, false, 4);
      (r.caso.preguntas ?? []).forEach((q) => line(q, 10, false, 2));
      y += 2;
      line("Resolución modelo", 11, true, 4);
      line(r.caso.resolucion_didactica, 10, false, 4);
      if (r.caso.fundamento_normativo) line(`Fundamento normativo: ${r.caso.fundamento_normativo}`, 9, false, 4);

      doc.save(`resultado-examen-${r.examenId}.pdf`);
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

  return (
    <section className="panel">
      <p><Link href="/" className="volver-inicio">← Inicio</Link></p>
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

      {/* Acciones */}
      <div className="res-acciones">
        <button type="button" className="btn cta" onClick={descargarPDF}>⬇ Descargar resultado en PDF</button>
        <Link href="/examen" className="btn btn-ghost btn-ghost-2">Hacer otro examen</Link>
      </div>
      {pdfMsg && <p className="placeholder-note">{pdfMsg}</p>}

      {/* Repaso */}
      <h2>Repaso pregunta por pregunta</h2>
      {r.preguntas.map((p, i) => (
        <div key={p.id} className="repaso">
          <p className="tema-chip">{p.tema}</p>
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

      {/* Caso */}
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

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/examen" className="cta">Hacer otro examen</Link>
      </p>
    </section>
  );
}
