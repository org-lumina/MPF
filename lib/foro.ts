import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";

/**
 * Devuelve true si el email pertenece a la lista ADMIN_EMAILS (env var,
 * separados por coma). Nunca se hardcodea ningún email en el repo.
 */
export function esAdmin(email?: string | null): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

export interface SesionForo {
  email: string;
  nombre: string;
  admin: boolean;
}

/**
 * Candado para endpoints de API (NO usa redirect, devuelve NextResponse).
 * - Sin sesión → 401.
 * - Logueado sin acceso vigente → 403.
 * - OK → { email, nombre (de la sesión), admin }.
 *
 * El nombre/email salen SIEMPRE de la sesión del servidor, nunca del body.
 */
export async function requerirAccesoApi(): Promise<
  SesionForo | { res: NextResponse }
> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { res: NextResponse.json({ error: "Iniciá sesión." }, { status: 401 }) };
  }
  if (!(await tieneAccesoVigente(email))) {
    return {
      res: NextResponse.json(
        { error: "Necesitás un acceso vigente." },
        { status: 403 }
      ),
    };
  }
  const nombre = (session?.user?.name ?? "").trim() || email.split("@")[0];
  return { email, nombre, admin: esAdmin(email) };
}
