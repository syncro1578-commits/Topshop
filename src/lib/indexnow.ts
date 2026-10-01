/**
 * IndexNow — notifie Bing, Yandex et les autres moteurs participants
 * (https://www.indexnow.org) qu'une URL a ete creee/modifiee/supprimee.
 *
 * ⚠️ Google ne participe PAS au protocole IndexNow (contrairement a Bing/
 * Yandex) — pour Google, seul le sitemap + une demande d'indexation manuelle
 * via Search Console accelerent le crawl.
 *
 * Le fichier de verification de la cle doit etre servi tel quel sur
 * `${SITE}/${INDEXNOW_KEY}.txt` — voir public/<cle>.txt.
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '099e919e1ff8a80bb627582e5534352e';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.toprix.tn';

// le relais generique est cense redistribuer a tous les moteurs participants,
// mais le rapport "URLs soumises (IndexNow)" de Bing Webmaster Tools ne
// reflete de maniere fiable que les soumissions recues directement sur son
// propre point d'entree : on soumet aux deux a chaque fois.
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

/** Soumet une ou plusieurs URLs a IndexNow. N'echoue jamais bruyamment
 * (fire-and-forget) : une erreur reseau ici ne doit jamais casser le
 * webhook appelant. */
export async function submitToIndexNow(urls: string | string[]): Promise<void> {
  const urlList = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (urlList.length === 0) return;

  const host = new URL(SITE).host;
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  await Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
        });
        if (!res.ok) {
          console.error('[indexnow]', endpoint, 'soumission refusee', res.status, await res.text().catch(() => ''));
        }
      } catch (err) {
        console.error('[indexnow]', endpoint, 'erreur reseau', err);
      }
    })
  );
}

export function productUrl(slug: string): string {
  return `${SITE}/produit/${slug}`;
}

export function categoryUrl(slug: string): string {
  return `${SITE}/categorie/${slug}`;
}
