import { supabaseAdmin } from "@/lib/supabase";

/** IDs de exámenes que el usuario ya completó (sin duplicados). */
export async function examenesCompletados(email: string): Promise<number[]> {
  if (!email) return [];
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("examenes_completados")
    .select("examen_id")
    .eq("user_email", email);
  if (error || !data) return [];
  return Array.from(new Set(data.map((r) => Number(r.examen_id))));
}

/** Registra que el usuario completó un examen. */
export async function registrarCompletado(
  email: string,
  examenId: number
): Promise<void> {
  if (!email) return;
  const sb = supabaseAdmin();
  await sb
    .from("examenes_completados")
    .insert({ user_email: email, examen_id: examenId });
}

// ---------- Namespacing por agrupación/modo (misma tabla, sin cambiar schema) ----------
// Jurídico: 1..30 · Administrativo: 1000+ · Solo-casos: 2000+ ·
// Empleo Admin: 3000+ · Empleo Profesionales: 4000+
const OFFSET_ADMIN = 1000;
const OFFSET_CASO = 2000;
const OFFSET_EMPLEO_ADMIN = 3000;
const OFFSET_EMPLEO_PROF = 4000;
const OFFSET_EMPLEO_PROF_TOPE = 5000;

/** examen_id administrativos ya completados (desnamespaceados). */
export async function completadosAdmin(email: string): Promise<number[]> {
  const all = await examenesCompletados(email);
  return all.filter((i) => i > OFFSET_ADMIN && i < OFFSET_CASO).map((i) => i - OFFSET_ADMIN);
}
export async function registrarAdminCompletado(email: string, examenId: number): Promise<void> {
  return registrarCompletado(email, OFFSET_ADMIN + examenId);
}

/** caso_id ya completados (desnamespaceados). Acotado para no capturar Empleo (3000+). */
export async function completadosCasos(email: string): Promise<number[]> {
  const all = await examenesCompletados(email);
  return all.filter((i) => i >= OFFSET_CASO && i < OFFSET_EMPLEO_ADMIN).map((i) => i - OFFSET_CASO);
}
export async function registrarCasoCompletado(email: string, casoId: number): Promise<void> {
  return registrarCompletado(email, OFFSET_CASO + casoId);
}

// ---------- Empleo Público ----------
/** examen_id de "Administrativos y Servicios Generales" ya completados. */
export async function completadosEmpleoAdmin(email: string): Promise<number[]> {
  const all = await examenesCompletados(email);
  return all
    .filter((i) => i >= OFFSET_EMPLEO_ADMIN && i < OFFSET_EMPLEO_PROF)
    .map((i) => i - OFFSET_EMPLEO_ADMIN);
}
export async function registrarEmpleoAdminCompletado(email: string, examenId: number): Promise<void> {
  return registrarCompletado(email, OFFSET_EMPLEO_ADMIN + examenId);
}

/** examen_id de "Profesionales" ya completados. */
export async function completadosEmpleoProf(email: string): Promise<number[]> {
  const all = await examenesCompletados(email);
  return all
    .filter((i) => i >= OFFSET_EMPLEO_PROF && i < OFFSET_EMPLEO_PROF_TOPE)
    .map((i) => i - OFFSET_EMPLEO_PROF);
}
export async function registrarEmpleoProfCompletado(email: string, examenId: number): Promise<void> {
  return registrarCompletado(email, OFFSET_EMPLEO_PROF + examenId);
}
