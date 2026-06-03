import { supabaseAdmin } from "@/lib/supabase";

export interface AccesoInfo {
  vigente: boolean;
  /** Fecha de vencimiento del último pago aprobado, o null si no hay pago. */
  vence: Date | null;
}

/**
 * Consulta el último pago aprobado del usuario y devuelve si está vigente
 * (vence > hoy) junto con la fecha de vencimiento.
 */
export async function obtenerAcceso(userEmail: string): Promise<AccesoInfo> {
  if (!userEmail) return { vigente: false, vence: null };
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("pagos")
    .select("vence, estado")
    .eq("user_email", userEmail)
    .eq("estado", "aprobado")
    .order("vence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { vigente: false, vence: null };
  const vence = new Date(data.vence as string);
  return { vigente: vence.getTime() > Date.now(), vence };
}

/**
 * Devuelve true si el usuario tiene un pago aprobado cuyo `vence` es futuro.
 * Es la función que protege la página de examen.
 */
export async function tieneAccesoVigente(userEmail: string): Promise<boolean> {
  return (await obtenerAcceso(userEmail)).vigente;
}
