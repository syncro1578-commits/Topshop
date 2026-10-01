import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPurchaseEvent } from '@/lib/metaConversions';

/**
 * WooCommerce webhook — order.updated / order.created
 *
 * Configure dans WC Admin → WooCommerce → Paramètres → Avancé → Webhooks
 *   Sujet  : order.updated
 *   URL    : https://shop.toprix.tn/api/webhook/wc-order
 *   Secret : valeur de WEBHOOK_SECRET dans .env.local
 */

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Vérification signature HMAC (si WEBHOOK_SECRET configuré)
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const sig = req.headers.get('x-wc-webhook-signature') ?? '';
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody, 'utf8')
        .digest('base64');
      if (sig !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // WC envoie parfois un corps vide pour le ping de test
    if (!rawBody.trim()) return NextResponse.json({ ok: true, skipped: true });

    let order: Record<string, unknown>;
    try { order = JSON.parse(rawBody); }
    catch { return NextResponse.json({ ok: true, skipped: true }); }

    const email     = (order.billing as Record<string, string> | undefined)?.email;
    const phone     = (order.billing as Record<string, string> | undefined)?.phone;
    const firstName = (order.billing as Record<string, string> | undefined)?.first_name;
    const orderId   = (order.number ?? order.id) as string | number | undefined;
    const status    = order.status as string | undefined;

    // N'envoyer que pour les statuts pertinents
    const NOTIFY = ['processing', 'completed', 'cancelled', 'on-hold', 'refunded'];
    if (!email || !status || !NOTIFY.includes(status)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.toprix.tn';
    // Fire-and-forget — ne bloque pas la réponse au webhook
    fetch(`${SITE}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:     'order_status',
        to:       email,
        orderId:  orderId,
        prenom:   firstName || 'Client',
        wcStatus: status,
      }),
    }).catch(() => {});

    // Meta Conversions API — Achat. Uniquement sur "processing" (premier
    // statut qui signifie "commande confirmee" dans ce flux COD), pour ne
    // compter l'achat qu'une seule fois meme si le webhook se redeclenche
    // plus tard pour "completed"/"on-hold"/etc. event_id stable = dedoublonnage
    // cote Meta en cas de nouvel essai du webhook pour ce meme statut.
    if (status === 'processing' && orderId != null) {
      const total = parseFloat((order.total as string) || '0');
      if (total > 0) {
        const rawLineItems = Array.isArray(order.line_items) ? order.line_items as Record<string, unknown>[] : [];
        const lineItems = rawLineItems
          .filter(li => typeof li.sku === 'string' && li.sku)
          .map(li => ({
            sku: li.sku as string,
            quantity: Number(li.quantity) || 1,
            price: Number(li.price) || 0,
          }));
        sendPurchaseEvent({
          eventId: `order_${orderId}_purchase`,
          value: total,
          currency: (order.currency as string) || 'TND',
          email,
          phone,
          lineItems,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook/wc-order]', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
