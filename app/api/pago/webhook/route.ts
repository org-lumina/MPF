import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/pago/webhook
// Mercado Pago avisa de un pago. Verificamos el pago contra la API de MP y,
// si está aprobado, escribimos en `pagos` (fecha_pago = hoy, vence = +6 meses).
export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "sin MP_ACCESS_TOKEN" }, { status: 500 });
    }

    const url = new URL(req.url);
    const body = (await req.json().catch(() => null)) as
      | { type?: string; data?: { id?: string | number } }
      | null;

    const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    const paymentId =
      body?.data?.id ??
      url.searchParams.get("data.id") ??
      url.searchParams.get("id");

    // Solo nos interesan notificaciones de pago.
    if (type && type !== "payment") {
      return NextResponse.json({ ok: true, ignorado: type });
    }
    if (!paymentId) {
      return NextResponse.json({ ok: false, error: "sin payment id" }, { status: 400 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const pago = await new Payment(client).get({ id: String(paymentId) });

    if (pago.status === "approved") {
      const meta = pago.metadata as { user_email?: string } | undefined;
      const email = meta?.user_email ?? pago.external_reference ?? pago.payer?.email ?? null;

      const fecha = new Date();
      const vence = new Date(fecha);
      vence.setMonth(vence.getMonth() + 6); // acceso por 6 meses

      const sb = supabaseAdmin();
      const { error } = await sb.from("pagos").upsert(
        {
          user_email: email,
          fecha_pago: fecha.toISOString(),
          vence: vence.toISOString(),
          estado: "aprobado",
          mp_payment_id: String(paymentId),
        },
        { onConflict: "mp_payment_id" }
      );
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, estado: pago.status });
  } catch (e) {
    // Devolvemos 200 para evitar reintentos infinitos de MP mientras se depura.
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
