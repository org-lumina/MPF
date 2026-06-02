import { supabaseAdmin } from "@/lib/supabase";

/**
 * Devuelve true si el usuario tiene un pago aprobado cuyo `vence` es futuro.
 * Consulta el último pago aprobado (vence más reciente) de ese email.
 * Esta función es la que luego protege la página de examen.
 */
export async function tieneAccesoVigente(userEmail: string): Promise<boolean> {
  if (!userEmail) return false;
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("pagos")
    .select("vence, estado")
    .eq("user_email", userEmail)
    .eq("estado", "aprobado")
    .order("vence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  return new Date(data.vence as string).getTime() > Date.now();
}
