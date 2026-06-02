import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { auth } from "@/auth";

// POST /api/pago/crear
// Crea una preferencia de Checkout Pro (AR$5000, acceso 6 meses) y devuelve
// el link de pago (init_point). Requiere usuario logueado.
export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Falta MP_ACCESS_TOKEN en .env.local" },
      { status: 500 }
    );
  }

  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  // Mercado Pago RECHAZA back_urls/notification_url/auto_return con localhost
  // (devuelve "auto_return invalid. back_url.success must be defined"). En local
  // omitimos auto_return y notification_url para que la preferencia se cree igual;
  // con una URL pública (ngrok / dominio de Vercel) se incluyen automáticamente.
  const esPublico = !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(base);
  const client = new MercadoPagoConfig({ accessToken });

  try {
    const pref = await new Preference(client).create({
      body: {
        items: [
          {
            id: "acceso-6m",
            title: "Acceso 6 meses Exámenes MPF",
            quantity: 1,
            unit_price: 5000,
            currency_id: "ARS",
          },
        ],
        payer: { email },
        // Para vincular el pago con el usuario en el webhook:
        metadata: { user_email: email },
        external_reference: email,
        back_urls: {
          success: `${base}/examen`,
          failure: `${base}/pago`,
          pending: `${base}/pago`,
        },
        // Solo con URL pública: MP no acepta localhost en estos campos.
        ...(esPublico
          ? {
              auto_return: "approved",
              notification_url: `${base}/api/pago/webhook`,
            }
          : {}),
      },
    });

    return NextResponse.json({ init_point: pref.init_point, id: pref.id });
  } catch (e) {
    // Logueamos el error REAL del SDK de MP (status + message + detalle) en consola
    // del servidor, y lo devolvemos en `detalle` en vez del mensaje genérico.
    const err = e as { message?: string; status?: number; error?: string };
    console.error("[/api/pago/crear] Error de Mercado Pago:", {
      status: err?.status,
      error: err?.error,
      message: err?.message,
    });
    return NextResponse.json(
      {
        error: "No se pudo crear la preferencia de pago",
        detalle: err?.message ?? String(e),
        mp_error: err?.error,
        mp_status: err?.status,
      },
      { status: 502 }
    );
  }
}
