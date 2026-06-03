import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { tieneAccesoVigente } from "@/lib/acceso";

/**
 * Candado de servidor para páginas que requieren acceso pago vigente.
 * - Sin sesión  → redirige a /login.
 * - Logueado sin acceso vigente → redirige a /pago (con motivo).
 * - Logueado con acceso vigente → devuelve el email.
 *
 * Como se ejecuta en el Server Component, no se puede saltar escribiendo la URL.
 */
export async function requerirAccesoVigente(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login?motivo=login");
  if (!(await tieneAccesoVigente(email))) redirect("/pago?motivo=acceso");
  return email;
}
