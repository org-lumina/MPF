import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para uso EN SERVIDOR (service/secret key).
// Se inicializa de forma perezosa para que el build no falle si las variables
// aún no están cargadas; solo se exige al usarlo en runtime.
let _admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SECRET_KEY en .env.local"
    );
  }
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}
