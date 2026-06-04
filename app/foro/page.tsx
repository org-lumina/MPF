import { requerirAccesoVigente } from "@/lib/guard";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { esAdmin } from "@/lib/foro";
import ForoView, { type Canal, type Mensaje } from "@/components/ForoView";

// El foro depende de la sesión y de datos en vivo: no cachear.
export const dynamic = "force-dynamic";

export default async function ForoPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  // Mismo candado que /examen: sin login → /login; sin pago → /pago.
  const email = await requerirAccesoVigente();
  const session = await auth();
  const nombre = (session?.user?.name ?? "").trim() || email.split("@")[0];
  const admin = esAdmin(email);
  const { c } = await searchParams;

  const sb = supabaseAdmin();
  const { data: canalesData } = await sb
    .from("foro_canales")
    .select("id, nombre, creado")
    .order("creado", { ascending: true });
  const canales = (canalesData ?? []) as Canal[];

  const activo =
    canales.find((x) => String(x.id) === c) ?? canales[0] ?? null;

  let mensajes: Mensaje[] = [];
  let hayMas = false;
  if (activo) {
    const COLS = "id, user_email, user_nombre, texto, creado, editado, parent_id";

    // Últimos 50 mensajes PRINCIPALES (más recientes primero; se muestran asc).
    const { data: princData } = await sb
      .from("foro_mensajes")
      .select(COLS)
      .eq("canal_id", activo.id)
      .is("parent_id", null)
      .order("creado", { ascending: false })
      .limit(50);
    const principales = ((princData ?? []) as Mensaje[]).reverse(); // → cronológico

    // ¿Hay más de 50 principales? (conteo liviano para el aviso sutil)
    const { count } = await sb
      .from("foro_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("canal_id", activo.id)
      .is("parent_id", null);
    hayMas = (count ?? 0) > 50;

    // TODAS las respuestas de esos 50 principales (no cuentan en el límite).
    let respuestas: Mensaje[] = [];
    if (principales.length > 0) {
      const ids = principales.map((p) => p.id);
      const { data: respData } = await sb
        .from("foro_mensajes")
        .select(COLS)
        .eq("canal_id", activo.id)
        .in("parent_id", ids)
        .order("creado", { ascending: true });
      respuestas = (respData ?? []) as Mensaje[];
    }

    mensajes = [...principales, ...respuestas];
  }

  return (
    <section className="foro-sec">
      <div className="wrap">
        <p className="eyebrow">
          <span className="dot" /> Comunidad
        </p>
        <h1 className="sec-title">
          Foro de <span className="mark">suscriptores</span>
        </h1>
        <p className="foro-intro">
          Un espacio para coordinar el estudio del Ingreso Democrático MPF.
          Escribí con respeto: tu nombre queda visible para el resto.
        </p>

        <ForoView
          canales={canales}
          activoId={activo?.id ?? null}
          mensajes={mensajes}
          hayMas={hayMas}
          me={{ email, nombre, admin }}
        />
      </div>
    </section>
  );
}
