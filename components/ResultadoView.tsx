"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResultadoExamenUI } from "@/lib/tipos";

export default function ResultadoView() {
  const [r, setR] = useState<ResultadoExamenUI | null>(null);
  const [cargo, setCargo] = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem("mpf_resultado");
    if (s) {
      try {
        setR(JSON.parse(s) as ResultadoExamenUI);
      } catch {
        setR(null);
      }
    }
    setCargo(true);
  }, []);

  if (!cargo) return <p>Cargando…</p>;
  if (!r) {
    return (
      <section>
        <h1>Resultados</h1>
        <p>
          No hay un resultado reciente. <Link href="/examen">Hacé un examen</Link>.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>Resultados — Examen N° {r.examenId}</h1>

      <p className="nota-grande">
        {r.nota.toFixed(2)} <span>/ 10</span>
      </p>
      <p>
        {r.aciertos} de {r.total} respuestas correctas.
      </p>

      <h2>Devolución por tema</h2>
      <p>{r.devolucion}</p>
      <ul className="por-tema">
        {Object.entries(r.porTema).map(([tema, t]) => (
          <li key={tema}>
            <strong>{tema}:</strong> {t.aciertos}/{t.total} ({t.porcentaje}%)
            {t.porcentaje >= 70 ? " ✓" : t.porcentaje < 50 ? " — reforzar" : ""}
          </li>
        ))}
      </ul>

      <h2>Repaso pregunta por pregunta</h2>
      {r.preguntas.map((p, i) => (
        <div key={p.id} className="repaso">
          <p className="tema-chip">[{p.tema}]</p>
          <p>
            <strong>
              {i + 1}. {p.enunciado}
            </strong>
          </p>
          <ul className="opciones">
            {p.opciones.map((o) => {
              const esElegida = o.letra === p.elegida;
              const esCorrecta = o.letra === p.correcta;
              const cls = esCorrecta
                ? "op-correcta"
                : esElegida
                  ? "op-incorrecta"
                  : "";
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
          {!p.elegida && (
            <p className="placeholder-note">No respondiste esta pregunta.</p>
          )}
          {/* Explicación de la opción correcta (cita norma + artículo) */}
          {p.opciones
            .filter((o) => o.letra === p.correcta)
            .map((o) => (
              <p key={o.letra} className="explicacion">
                {o.explicacion}
              </p>
            ))}
          {/* Si erró, también por qué su opción es incorrecta */}
          {p.elegida &&
            !p.acerto &&
            p.opciones
              .filter((o) => o.letra === p.elegida)
              .map((o) => (
                <p key={o.letra} className="explicacion explicacion-mal">
                  Tu opción: {o.explicacion}
                </p>
              ))}
        </div>
      ))}

      <h2>Caso práctico</h2>
      {r.caso.planteo ? (
        <>
          {r.caso.planteo
            .split("\n")
            .filter((l) => l.trim())
            .map((ln, i) => (
              <p key={i} className="caso-planteo">
                {ln}
              </p>
            ))}
          {r.caso.preguntas && r.caso.preguntas.length > 0 && (
            <div className="caso-preguntas">
              {r.caso.preguntas.map((q, i) => (
                <p key={i}>{q}</p>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="caso-enunciado">{r.caso.enunciado}</p>
      )}

      <h3>Resolución modelo</h3>
      {r.caso.resolucion_didactica
        .split("\n")
        .filter((l) => l.trim())
        .map((ln, i) => {
          const m = ln.match(/^\s*(Pregunta\s*\d+\s*[:.)])(.*)$/);
          return (
            <p key={i} className="reso-linea">
              {m ? (
                <>
                  <strong>{m[1]}</strong>
                  {m[2]}
                </>
              ) : (
                ln
              )}
            </p>
          );
        })}
      {r.caso.fundamento_normativo && (
        <p className="placeholder-note">
          Fundamento normativo: {r.caso.fundamento_normativo}
        </p>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/examen" className="cta">
          Hacer otro examen
        </Link>
      </p>
    </section>
  );
}
