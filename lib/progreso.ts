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
