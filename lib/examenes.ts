import fs from "node:fs";
import path from "node:path";

// ---------- Tipos ----------
export type Letra = "A" | "B" | "C" | "D";

export interface Opcion {
  letra: Letra;
  texto: string;
  correcta: boolean;
  explicacion: string;
}

export interface Pregunta {
  id: number;
  tema: string;
  enunciado: string;
  opciones: Opcion[];
  /** Solo en Comprensión Lectora (Empleo Público): el fragmento a leer. */
  texto_base?: string;
}

export interface Caso {
  enunciado: string;
  consigna: string;
  resolucion_didactica: string;
  fundamento_normativo?: string;
  // Campos estructurados del caso rediseñado (opcionales para compatibilidad).
  planteo?: string;
  preguntas?: string[];
  aclaracion?: string;
}

export interface Examen {
  examen_id: number;
  preguntas: Pregunta[];
  caso: Caso;
}

export type RespuestasUsuario = Record<number, Letra>;

export interface DetallePregunta {
  id: number;
  tema: string;
  letraCorrecta: Letra | null;
  letraElegida: Letra | null;
  acerto: boolean;
}

export interface ResumenTema {
  aciertos: number;
  total: number;
  porcentaje: number; // 0..100
}

export interface ResultadoCorreccion {
  examenId: number;
  total: number;
  aciertos: number;
  nota: number; // 0..10
  detalle: DetallePregunta[];
  porTema: Record<string, ResumenTema>;
}

// Lista cerrada de temas (derivada del material fuente).
export const TEMAS: readonly string[] = [
  "Constitución Nacional",
  "Ley Orgánica del MPF (Ley N° 27.148)",
  "Ingreso democrático e igualitario al MPF",
  "Régimen de funcionarios y empleados del MPF (Res. PGN 128/2010)",
  "Derechos humanos: sistema interamericano y CEDAW",
  "Género y violencia contra la mujer",
  "Protección integral de personas con discapacidad (Ley N° 22.431)",
  "Organización del MPF y proceso penal federal",
];

// ---------- Carga ----------
const DIR_EXAMENES = path.join(process.cwd(), "data", "examenes");

/** Lee los 30 JSON de /data/examenes/ y los devuelve ordenados por examen_id. */
export function cargarExamenes(dir: string = DIR_EXAMENES): Examen[] {
  const archivos = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const examenes = archivos.map(
    (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as Examen
  );
  return examenes.sort((a, b) => a.examen_id - b.examen_id);
}

// ---------- Selección ----------
/**
 * Devuelve un examen_id que NO esté en `completados`.
 * Si ya se completaron todos, reinicia el ciclo (elige sobre el set completo).
 * `rng` inyectable para tests deterministas.
 */
export function elegirExamenAleatorio(
  completados: number[],
  opciones?: { ids?: number[]; rng?: () => number }
): number {
  const ids = opciones?.ids ?? Array.from({ length: 30 }, (_, i) => i + 1);
  const rng = opciones?.rng ?? Math.random;
  const pendientes = ids.filter((id) => !completados.includes(id));
  const universo = pendientes.length > 0 ? pendientes : ids; // ciclo reiniciado
  const i = Math.floor(rng() * universo.length);
  return universo[i];
}

// ---------- Corrección ----------
function letraCorrectaDe(p: Pregunta): Letra | null {
  const c = p.opciones.find((o) => o.correcta);
  return c ? c.letra : null;
}

/**
 * Corrige un examen. El caso práctico NO se corrige (solo se muestra su
 * resolución didáctica al final, fuera de esta función).
 */
export function corregirExamen(
  respuestasUsuario: RespuestasUsuario,
  examen: { examen_id: number; preguntas: Pregunta[] }
): ResultadoCorreccion {
  const detalle: DetallePregunta[] = [];
  const porTema: Record<string, ResumenTema> = {};
  let aciertos = 0;

  for (const p of examen.preguntas) {
    const correcta = letraCorrectaDe(p);
    const elegida = respuestasUsuario[p.id] ?? null;
    const acerto = correcta !== null && elegida === correcta;
    if (acerto) aciertos++;

    detalle.push({
      id: p.id,
      tema: p.tema,
      letraCorrecta: correcta,
      letraElegida: elegida,
      acerto,
    });

    const t = (porTema[p.tema] ??= { aciertos: 0, total: 0, porcentaje: 0 });
    t.total++;
    if (acerto) t.aciertos++;
  }

  for (const t of Object.values(porTema)) {
    t.porcentaje = t.total > 0 ? Math.round((t.aciertos / t.total) * 100) : 0;
  }

  const total = examen.preguntas.length;
  const nota = total > 0 ? Math.round((aciertos / total) * 10 * 100) / 100 : 0;

  return { examenId: examen.examen_id, total, aciertos, nota, detalle, porTema };
}

// ---------- Devolución ----------
/**
 * Genera un texto de devolución a partir del desglose por tema:
 * fortalezas (>=70%) y temas a reforzar (<50%).
 */
export function generarDevolucion(
  porTema: Record<string, ResumenTema>
): string {
  const fortalezas: string[] = [];
  const reforzar: string[] = [];
  const intermedios: string[] = [];

  for (const [tema, r] of Object.entries(porTema)) {
    if (r.total === 0) continue;
    if (r.porcentaje >= 70) fortalezas.push(tema);
    else if (r.porcentaje < 50) reforzar.push(tema);
    else intermedios.push(tema);
  }

  const partes: string[] = [];
  if (fortalezas.length) {
    partes.push(`Dominás: ${fortalezas.join("; ")}.`);
  }
  if (intermedios.length) {
    partes.push(`Vas bien, pero podés afianzar: ${intermedios.join("; ")}.`);
  }
  if (reforzar.length) {
    partes.push(`A reforzar con prioridad: ${reforzar.join("; ")}.`);
  }
  if (!partes.length) {
    partes.push("Completá un examen para obtener tu devolución por tema.");
  }
  return partes.join(" ");
}

// ====================================================================
//  Contenido adicional: examen administrativo y casos prácticos
// ====================================================================

export interface ExamenAdmin {
  examen_id: number;
  agrupacion: string;
  preguntas: Pregunta[]; // 20 preguntas, cada una con tema; sin caso
}

export interface CasoPractico {
  caso_id: number;
  eje: string;
  planteo: string;
  preguntas: { id: number; enunciado: string; opciones: Opcion[] }[]; // 5
  resolucion_didactica: string;
}

const DIR_ADMIN = path.join(process.cwd(), "data", "examenes-administrativo");
const DIR_CASOS = path.join(process.cwd(), "data", "casos");

/** Lee los exámenes administrativos presentes (ordenados por examen_id). */
export function cargarAdministrativos(dir: string = DIR_ADMIN): ExamenAdmin[] {
  const archivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return archivos
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ExamenAdmin)
    .sort((a, b) => a.examen_id - b.examen_id);
}

/** Lee los casos prácticos presentes (tolera huecos, ej. caso-03 borrado). */
export function cargarCasos(dir: string = DIR_CASOS): CasoPractico[] {
  const archivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return archivos
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as CasoPractico)
    .sort((a, b) => a.caso_id - b.caso_id);
}

// ====================================================================
//  Empleo Público (Administrativos y Servicios Generales · Profesionales)
//  Cada pregunta trae `eje`; lo mapeamos a `tema` para reutilizar el
//  corrector, la devolución y el resultado del MPF. Conserva `texto_base`.
// ====================================================================

export interface ExamenEmpleo {
  examen_id: number;
  tipo: string;
  preguntas: Pregunta[]; // 25; tema = eje; texto_base solo en Comprensión Lectora
}

interface ExamenEmpleoRaw {
  examen_id: number;
  tipo: string;
  preguntas: {
    id: number;
    eje: string;
    texto_base?: string;
    enunciado: string;
    opciones: Opcion[];
  }[];
}

const DIR_EMPLEO_ADMIN = path.join(process.cwd(), "data", "empleo-administrativos");
const DIR_EMPLEO_PROF = path.join(process.cwd(), "data", "empleo-profesionales");

function cargarEmpleo(dir: string): ExamenEmpleo[] {
  const archivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return archivos
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ExamenEmpleoRaw)
    .map((e) => ({
      examen_id: e.examen_id,
      tipo: e.tipo,
      preguntas: e.preguntas.map((p) => ({
        id: p.id,
        tema: p.eje, // eje → tema (reutiliza corrector/desglose)
        enunciado: p.enunciado,
        opciones: p.opciones,
        texto_base: p.texto_base,
      })),
    }))
    .sort((a, b) => a.examen_id - b.examen_id);
}

/** Exámenes "Administrativos y Servicios Generales" (2 ejes). */
export function cargarEmpleoAdmin(dir: string = DIR_EMPLEO_ADMIN): ExamenEmpleo[] {
  return cargarEmpleo(dir);
}
/** Exámenes "Profesionales" (3 ejes, incluye Administración Pública Nacional). */
export function cargarEmpleoProf(dir: string = DIR_EMPLEO_PROF): ExamenEmpleo[] {
  return cargarEmpleo(dir);
}
