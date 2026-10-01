'use client';

/**
 * Evenements Meta Pixel standard (ViewContent, AddToCart) envoyes cote
 * navigateur. content_ids DOIT correspondre a la colonne "id" du catalogue
 * Facebook (voir facebook-feed.csv/route.ts), c'est a dire le SKU
 * WooCommerce (= UUID Shipper), PAS l'id numerique WooCommerce — sinon le
 * taux de correspondance catalogue reste a 0%.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface ProductTrackingData {
  sku: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}

function track(event: string, data: ProductTrackingData): void {
  if (typeof window === 'undefined' || !window.fbq || !data.sku) return;
  window.fbq('track', event, {
    content_ids: [data.sku],
    content_type: 'product',
    content_name: data.name,
    value: data.price * (data.quantity || 1),
    currency: data.currency || 'TND',
  });
}

export function trackViewContent(data: ProductTrackingData): void {
  track('ViewContent', data);
}

export function trackAddToCart(data: ProductTrackingData): void {
  track('AddToCart', data);
}
