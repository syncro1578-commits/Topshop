import crypto from 'crypto';

/**
 * Meta Conversions API — evenements serveur en complement du Pixel
 * navigateur (voir layout.tsx). https://graph.facebook.com/{v}/{pixel}/events
 *
 * META_CAPI_ACCESS_TOKEN doit etre defini en variable d'environnement
 * (genere depuis Events Manager > Pixel > API Conversions > Integration
 * directe). Jamais ecrit en dur ici.
 */

const PIXEL_ID = '28663851839897938';
const API_VERSION = 'v21.0';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.toprix.tn';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface PurchaseEventInput {
  /** Identifiant stable (ex: `order_123`) pour le dedoublonnage cote Meta
   * si l'evenement est renvoye plusieurs fois pour la meme commande. */
  eventId: string;
  value: number;
  currency: string;
  email?: string;
  phone?: string;
}

/** Envoie un evenement Purchase. N'echoue jamais bruyamment (fire-and-forget) :
 * une erreur ici ne doit jamais casser le webhook appelant. */
export async function sendPurchaseEvent(input: PurchaseEventInput): Promise<void> {
  if (!ACCESS_TOKEN) {
    console.error('[meta-capi] META_CAPI_ACCESS_TOKEN manquant, evenement Purchase non envoye');
    return;
  }

  const userData: Record<string, string[]> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) {
    const digits = input.phone.replace(/\D/g, '');
    if (digits) userData.ph = [sha256(digits)];
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: SITE,
        user_data: userData,
        custom_data: {
          currency: input.currency,
          value: input.value.toFixed(2),
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      console.error('[meta-capi] envoi refuse', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[meta-capi] erreur reseau', err);
  }
}
