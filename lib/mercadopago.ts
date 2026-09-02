import crypto from "crypto";

/**
 * Valida la firma de un webhook de MercadoPago.
 *
 * Solo se exige si `MERCADOPAGO_WEBHOOK_SECRET` está configurado; si no,
 * devuelve `true` para no romper el flujo actual (los handlers igual
 * re-consultan el pago contra la API de MP antes de confiar en él).
 *
 * Docs: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoSignature(req: Request, dataId: string | undefined): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // no configurado todavía

  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signature) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId ?? ""};request-id:${requestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}
