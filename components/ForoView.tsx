"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Canal {
  id: number;
  nombre: string;
  creado: string;
}
export interface Mensaje {
  id: number;
  user_email: string;
  user_nombre: string;
  texto: string;
  creado: string;
  editado: string | null;
  parent_id: number | null;
}
interface Me {
  email: string;
  nombre: string;
  admin: boolean;
}

const MAX = 2000;

// Formateo determinístico a hora de Argentina (UTC−3 fijo, sin horario de verano).
// Usa getters UTC tras aplicar el offset, de modo que servidor y cliente produzcan
// EXACTAMENTE el mismo string → sin mismatch de hidratación ni parpadeo.
function fecha(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const d = new Date(ms - 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  const dia = p(d.getUTCDate());
  const mes = p(d.getUTCMonth() + 1);
  const anio = p(d.getUTCFullYear() % 100);
  const hh = p(d.getUTCHours());
  const mm = p(d.getUTCMinutes());
  return `${dia}/${mes}/${anio} ${hh}:${mm}`;
}

export default function ForoView({
  canales,
  activoId,
  mensajes,
  hayMas = false,
  me,
}: {
  canales: Canal[];
  activoId: number | null;
  mensajes: Mensaje[];
  hayMas?: boolean;
  me: Me;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // edición
  const [editId, setEditId] = useState<number | null>(null);
  const [editTexto, setEditTexto] = useState("");

  // responder (a un mensaje principal)
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyTexto, setReplyTexto] = useState("");

  // crear canal (admin)
  const [nuevoCanalOpen, setNuevoCanalOpen] = useState(false);
  const [nuevoCanal, setNuevoCanal] = useState("");

  const activo = canales.find((c) => c.id === activoId) ?? null;

  // Agrupar: principales (parent_id null) + respuestas por padre, ambos cronológicos.
  const principales = mensajes.filter((m) => m.parent_id == null);
  const respuestasDe = (padreId: number) =>
    mensajes.filter((m) => m.parent_id === padreId);

  async function publicar() {
    setError(null);
    const t = texto.trim();
    if (!t) { setError("Escribí algo antes de publicar."); return; }
    if (t.length > MAX) { setError(`Máximo ${MAX} caracteres.`); return; }
    if (!activo) { setError("Elegí un canal."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/foro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal_id: activo.id, texto: t }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo publicar."); return; }
      setTexto("");
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function responder(parentId: number) {
    setError(null);
    const t = replyTexto.trim();
    if (!t) { setError("Escribí la respuesta."); return; }
    if (t.length > MAX) { setError(`Máximo ${MAX} caracteres.`); return; }
    if (!activo) return;
    setBusy(true);
    try {
      const res = await fetch("/api/foro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal_id: activo.id, texto: t, parent_id: parentId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo responder."); return; }
      setReplyTexto("");
      setReplyId(null);
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function guardarEdicion(id: number) {
    setError(null);
    const t = editTexto.trim();
    if (!t) { setError("El mensaje no puede quedar vacío."); return; }
    if (t.length > MAX) { setError(`Máximo ${MAX} caracteres.`); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/foro/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: t }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo editar."); return; }
      setEditId(null);
      setEditTexto("");
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function borrar(id: number) {
    if (!confirm("¿Borrar este mensaje?")) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/foro/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "No se pudo borrar."); return; }
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function crearCanal() {
    setError(null);
    const n = nuevoCanal.trim();
    if (!n) { setError("Poné un título al canal."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/foro/canales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: n }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo crear el canal."); return; }
      setNuevoCanal("");
      setNuevoCanalOpen(false);
      router.push(`/foro?c=${data.canal.id}`);
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function borrarCanal() {
    if (!activo) return;
    if (!confirm(`¿Borrar el canal "${activo.nombre}" y todos sus mensajes?`)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/foro/canales/${activo.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "No se pudo borrar el canal."); return; }
      router.push("/foro");
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  // Render de un mensaje (principal o respuesta). esRespuesta=true → sin botón "Responder".
  function renderMensaje(m: Mensaje, esRespuesta: boolean) {
    const esMio = m.user_email === me.email;
    const puedeBorrar = esMio || me.admin;
    return (
      <article key={m.id} className={`foro-msg${esMio ? " mio" : ""}${esRespuesta ? " respuesta" : ""}`}>
        <header className="msg-head">
          <span className="msg-autor">{m.user_nombre}</span>
          <span className="msg-fecha">
            {fecha(m.creado)}
            {m.editado && <em> · editado</em>}
          </span>
        </header>

        {editId === m.id ? (
          <div className="msg-edit">
            <textarea
              value={editTexto}
              maxLength={MAX}
              rows={3}
              onChange={(e) => setEditTexto(e.target.value)}
            />
            <div className="msg-edit-actions">
              <div className="char-count">{editTexto.length}/{MAX}</div>
              <button type="button" className="btn btn-sm" onClick={() => guardarEdicion(m.id)} disabled={busy}>
                Guardar
              </button>
              <button type="button" className="btn btn-ghost btn-mini" onClick={() => setEditId(null)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="msg-texto">{m.texto}</p>
        )}

        {editId !== m.id && (
          <div className="msg-acciones">
            {!esRespuesta && (
              <button
                type="button"
                className="msg-link"
                onClick={() => {
                  setReplyId(replyId === m.id ? null : m.id);
                  setReplyTexto("");
                  setError(null);
                }}
              >
                Responder
              </button>
            )}
            {esMio && (
              <button
                type="button"
                className="msg-link"
                onClick={() => { setEditId(m.id); setEditTexto(m.texto); setError(null); }}
              >
                Editar
              </button>
            )}
            {puedeBorrar && (
              <button type="button" className="msg-link danger" onClick={() => borrar(m.id)}>
                Borrar
              </button>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="foro-grid">
      {/* Columna de canales */}
      <aside className="foro-canales card">
        <div className="foro-canales-head">
          <span>Canales</span>
          {me.admin && (
            <button
              type="button"
              className="canal-add"
              onClick={() => setNuevoCanalOpen((v) => !v)}
              aria-label="Nuevo canal"
              title="Nuevo canal"
            >
              +
            </button>
          )}
        </div>

        {me.admin && nuevoCanalOpen && (
          <div className="canal-nuevo">
            <input
              type="text"
              value={nuevoCanal}
              maxLength={120}
              placeholder="Título del canal"
              onChange={(e) => setNuevoCanal(e.target.value)}
            />
            <button type="button" className="btn btn-sm" onClick={crearCanal} disabled={busy}>
              Crear
            </button>
          </div>
        )}

        <ul className="canal-list">
          {canales.map((c) => (
            <li key={c.id}>
              <Link
                href={`/foro?c=${c.id}`}
                className={`canal-chip${c.id === activoId ? " activa" : ""}`}
              >
                {c.nombre}
              </Link>
            </li>
          ))}
          {canales.length === 0 && (
            <li className="canal-vacio">Todavía no hay canales.</li>
          )}
        </ul>
      </aside>

      {/* Muro del canal activo */}
      <div className="foro-panel card">
        <div className="foro-panel-head">
          <h2>{activo ? activo.nombre : "Sin canal"}</h2>
          {me.admin && activo && (
            <button type="button" className="canal-del" onClick={borrarCanal} disabled={busy}>
              Borrar canal
            </button>
          )}
        </div>

        {hayMas && (
          <p className="foro-aviso">Mostrando los últimos 50 mensajes</p>
        )}

        <div className="foro-muro">
          {principales.length === 0 && (
            <p className="foro-empty">Todavía no hay mensajes. ¡Escribí el primero!</p>
          )}
          {principales.map((m) => {
            const hijas = respuestasDe(m.id);
            return (
              <div key={m.id} className="foro-hilo">
                {renderMensaje(m, false)}

                {replyId === m.id && (
                  <div className="foro-reply-form">
                    <textarea
                      value={replyTexto}
                      maxLength={MAX}
                      rows={2}
                      placeholder="Escribí tu respuesta…"
                      onChange={(e) => setReplyTexto(e.target.value)}
                    />
                    <div className="msg-edit-actions">
                      <div className="char-count">{replyTexto.length}/{MAX}</div>
                      <button type="button" className="btn btn-sm" onClick={() => responder(m.id)} disabled={busy}>
                        Responder
                      </button>
                      <button type="button" className="btn btn-ghost btn-mini" onClick={() => setReplyId(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {hijas.length > 0 && (
                  <div className="foro-respuestas">
                    {hijas.map((h) => renderMensaje(h, true))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="form-msg-err">{error}</p>}

        {activo && (
          <div className="foro-form">
            <textarea
              value={texto}
              maxLength={MAX}
              rows={3}
              placeholder="Escribí un mensaje…"
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="foro-form-foot">
              <div className="char-count">{texto.length}/{MAX}</div>
              <button type="button" className="btn cta" onClick={publicar} disabled={busy}>
                {busy ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
