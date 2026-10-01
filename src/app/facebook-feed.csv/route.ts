import { NextResponse } from 'next/server';

/**
 * Flux produit CSV au format Meta Commerce Catalog (Facebook/Instagram Shop,
 * eligible Marketplace selon categorie/pays).
 * A enregistrer dans Meta Commerce Manager > Sources de donnees > Flux planifie :
 *   https://shop.toprix.tn/facebook-feed.csv
 * Reference du schema : https://www.facebook.com/business/help/120325381656392
 */

const SITE      = process.env.NEXT_PUBLIC_SITE_URL   || 'https://shop.toprix.tn';
const WC_URL    = process.env.NEXT_PUBLIC_WC_URL     || 'https://wc.toprix.tn';
const WC_KEY    = process.env.WC_CONSUMER_KEY         || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET      || '';

export const revalidate = 3600; // 1h

interface WCImage { src: string }
interface WCMeta { key: string; value: string }
interface WCProduct {
  sku: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  regular_price: string;
  price: string;
  stock_status: string;
  images: WCImage[];
  meta_data: WCMeta[];
}

const TITLE_MAX = 150;
const DESCRIPTION_MAX = 5000;

async function fetchAllProducts(): Promise<WCProduct[]> {
  const products: WCProduct[] = [];
  let page = 1;
  const fields = 'sku,name,slug,description,short_description,regular_price,price,stock_status,images,meta_data';

  while (true) {
    const url = new URL(`${WC_URL}/wp-json/wc/v3/products`);
    url.searchParams.set('consumer_key', WC_KEY);
    url.searchParams.set('consumer_secret', WC_SECRET);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('status', 'publish');
    url.searchParams.set('_fields', fields);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) break;

    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const data: WCProduct[] = await res.json();
    products.push(...data);

    if (page >= totalPages) break;
    page++;
  }

  return products;
}

function stripHtml(value: string | undefined): string {
  if (!value) return '';
  const text = value.replace(/<[^>]+>/g, ' ');
  const withoutEntities = text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
  return withoutEntities.replace(/\s+/g, ' ').trim();
}

function imageUrl(p: WCProduct): string {
  if (p.images?.[0]?.src) return p.images[0].src;
  const meta = p.meta_data?.find(m => m.key === '_toprix_image_url');
  return meta?.value || '';
}

/** Echappe un champ pour CSV (RFC 4180) : double les guillemets, entoure de
 * guillemets si le champ contient une virgule, un guillemet ou un saut de ligne. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toRow(p: WCProduct): string[] | null {
  if (!p.sku || !p.name) return null;

  const priceVal = parseFloat(p.regular_price || p.price);
  if (!Number.isFinite(priceVal)) return null;

  const img = imageUrl(p);
  if (!img) return null;

  const description = stripHtml(p.description || p.short_description || p.name);

  return [
    p.sku,
    p.name.slice(0, TITLE_MAX),
    description.slice(0, DESCRIPTION_MAX),
    p.stock_status === 'instock' ? 'in stock' : 'out of stock',
    'new',
    `${priceVal.toFixed(2)} TND`,
    `${SITE}/produit/${p.slug}`,
    img,
    'Toprix',
  ];
}

export async function GET() {
  const products = await fetchAllProducts().catch(() => []);

  const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'];
  const lines = [header.map(csvField).join(',')];

  for (const p of products) {
    const row = toRow(p);
    if (row) lines.push(row.map(csvField).join(','));
  }

  const csv = '﻿' + lines.join('\r\n') + '\r\n';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  });
}
