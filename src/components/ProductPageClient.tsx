'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { WCProduct } from '@/lib/woocommerce';
import { getProductImage } from '@/lib/woocommerce';
import { useCart } from '@/lib/cart';
import { trackViewContent, trackAddToCart } from '@/lib/metaPixel';

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const empty = 5 - full;
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#FFB800', fontSize: 15 }}>
      {'★'.repeat(full)}
      <span style={{ color: '#e0e0e0' }}>{'★'.repeat(empty)}</span>
    </span>
  );
}

export default function ProductPageClient({ product }: { product: WCProduct }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'avis'>('desc');
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const images = product.images?.length ? product.images : [];
  const fallbackImg = getProductImage(product);
  const displayImg = images[activeImg]?.src || fallbackImg;

  const price = parseFloat(product.price) || 0;
  const regular = parseFloat(product.regular_price) || price;
  const disc = regular > price ? Math.round((regular - price) / regular * 100) : 0;
  const savings = regular > price ? (regular - price).toFixed(3) : null;
  const rating = parseFloat(product.average_rating) || 0;
  const brand = product.tags?.find(t => t.name.length < 20)?.name || '';

  const itemData = { id: Number(product.id), slug: product.slug, name: product.name, price, img: displayImg };

  useEffect(() => {
    if (product.sku) {
      trackViewContent({ sku: product.sku, name: product.name, price });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  function handleAdd() {
    addItem(itemData, qty);
    if (product.sku) trackAddToCart({ sku: product.sku, name: product.name, price, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(itemData, qty);
    if (product.sku) trackAddToCart({ sku: product.sku, name: product.name, price, quantity: qty });
  }

  const tabs: { id: 'desc' | 'spec' | 'avis'; label: string }[] = [
    { id: 'desc', label: 'Description' },
    { id: 'spec', label: 'Fiche technique' },
    { id: 'avis', label: `Avis (${product.rating_count || 0})` },
  ];

  return (
    <>
      <style>{`
        .pp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 16px 80px; }
        .pp-breadcrumb { padding: 14px 0 10px; font-size: 12px; color: #888; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .pp-breadcrumb a { color: #888; text-decoration: none; }
        .pp-breadcrumb a:hover { color: #111; }
        .pp-breadcrumb .sep { color: #ccc; }
        .pp-breadcrumb .cur { color: #111; font-weight: 600; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .pp-main { display: grid; grid-template-columns: 55% 45%; gap: 28px; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.07); }

        /* Gallery */
        .pp-gallery { display: flex; flex-direction: column; gap: 12px; }
        .pp-main-img { position: relative; aspect-ratio: 1; background: #F8F9FA; border-radius: 14px; overflow: hidden; cursor: zoom-in; display: flex; align-items: center; justify-content: center; }
        .pp-main-img img { transition: transform .3s; }
        .pp-main-img:hover img { transform: scale(1.05); }
        .pp-disc-badge { position: absolute; top: 14px; left: 14px; background: #E2231A; color: #fff; font-weight: 800; font-size: 12px; padding: 5px 10px; border-radius: 6px; z-index: 2; }
        .pp-wish-btn { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; background: #fff; border: 1px solid #ececec; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: all .15s; box-shadow: 0 2px 6px rgba(0,0,0,.08); z-index: 2; }
        .pp-wish-btn:hover { transform: scale(1.08); }
        .pp-wish-btn.on { color: #dc2626; border-color: #dc2626; background: #fee2e2; }
        .pp-thumbs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
        .pp-thumbs::-webkit-scrollbar { display: none; }
        .pp-thumb { flex: 0 0 auto; width: 60px; height: 60px; background: #F8F9FA; border: 2px solid transparent; border-radius: 10px; padding: 6px; cursor: pointer; transition: border-color .12s; }
        .pp-thumb img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
        .pp-thumb.active { border-color: #FFB800; }
        .pp-thumb:hover { border-color: #ddd; }

        /* Info */
        .pp-info { display: flex; flex-direction: column; gap: 14px; }
        .pp-brand { display: inline-flex; align-items: center; gap: 6px; background: #111; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: .07em; padding: 4px 10px; border-radius: 4px; align-self: flex-start; }
        .pp-title { font-size: 20px; font-weight: 700; line-height: 1.35; margin: 0; color: #111; }
        .pp-rating-row { display: flex; align-items: center; gap: 8px; font-size: 13px; flex-wrap: wrap; }
        .pp-rating-num { font-weight: 700; color: #111; }
        .pp-rating-link { color: #888; cursor: pointer; }
        .pp-rating-link:hover { color: #111; }
        .pp-sku { font-size: 12px; color: #888; }
        .pp-sku strong { color: #555; }

        /* Price block */
        .pp-price-block { background: linear-gradient(180deg, #FFF9E1, #fff); border: 1px solid #FFE08A; border-radius: 14px; padding: 16px 18px; }
        .pp-price-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .pp-price-current { font-size: 30px; font-weight: 900; color: #111; letter-spacing: -.02em; line-height: 1; }
        .pp-price-cur { font-size: 15px; font-weight: 700; color: #555; margin-left: 4px; }
        .pp-price-old { font-size: 15px; color: #aaa; text-decoration: line-through; }
        .pp-savings { color: #16a34a; font-size: 13px; font-weight: 700; margin-top: 6px; }

        /* Delivery */
        .pp-delivery-card { border: 1px solid #ececec; border-radius: 12px; overflow: hidden; }
        .pp-delivery-row { display: grid; grid-template-columns: 36px 1fr auto 20px; align-items: center; gap: 10px; padding: 11px 14px; border-bottom: 1px solid #f3f3f3; cursor: pointer; transition: background .12s; }
        .pp-delivery-row:last-child { border-bottom: 0; }
        .pp-delivery-row:hover { background: #fafafa; }
        .pp-delivery-row.active { background: #FFFCEF; }
        .pp-delivery-row.active.express { border-left: 3px solid #FFB800; padding-left: 11px; }
        .pp-dlv-ico { width: 36px; height: 36px; background: #F8F9FA; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .pp-dlv-ico.exp { background: #FFB800; }
        .pp-dlv-label { font-size: 13px; font-weight: 600; }
        .pp-dlv-label small { display: block; font-weight: 400; color: #888; font-size: 12px; margin-top: 1px; }
        .pp-dlv-price { font-size: 12px; font-weight: 700; color: #111; white-space: nowrap; }
        .pp-dlv-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ccc; transition: border-color .12s; position: relative; flex-shrink: 0; }
        .pp-delivery-row.active .pp-dlv-radio { border-color: #FFB800; }
        .pp-delivery-row.active .pp-dlv-radio::after { content: ""; position: absolute; top: 50%; left: 50%; width: 8px; height: 8px; background: #FFB800; border-radius: 50%; transform: translate(-50%,-50%); }

        /* Stock */
        .pp-stock { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; padding: 7px 12px; border-radius: 100px; }
        .pp-stock.in { background: #dcfce7; color: #16a34a; }
        .pp-stock.out { background: #fee2e2; color: #dc2626; }

        /* Qty */
        .pp-qty-wrap { display: flex; flex-direction: column; gap: 5px; }
        .pp-qty-label { font-size: 12px; font-weight: 600; color: #555; }
        .pp-qty { display: inline-flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .pp-qty-btn { background: #fff; border: 0; width: 38px; height: 40px; font-size: 18px; font-weight: 700; color: #111; cursor: pointer; transition: background .12s; display: flex; align-items: center; justify-content: center; }
        .pp-qty-btn:hover { background: #FFF5D6; }
        .pp-qty-btn:disabled { color: #ccc; cursor: not-allowed; }
        .pp-qty-num { width: 44px; text-align: center; font-size: 15px; font-weight: 700; border-left: 1px solid #eee; border-right: 1px solid #eee; height: 40px; display: flex; align-items: center; justify-content: center; }

        /* Buttons */
        .pp-actions { display: flex; flex-direction: column; gap: 10px; }
        .pp-btn { height: 50px; border-radius: 10px; border: 0; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all .12s; width: 100%; text-decoration: none; }
        .pp-btn:active { transform: scale(.99); }
        .pp-btn-primary { background: #FFB800; color: #111; box-shadow: 0 4px 0 #F2A900; }
        .pp-btn-primary:hover { background: #F2A900; }
        .pp-btn-primary.added { background: #16a34a; color: #fff; box-shadow: 0 4px 0 #0d7a2e; }
        .pp-btn-secondary { background: #111; color: #fff; }
        .pp-btn-secondary:hover { background: #000; }
        .pp-btn-tertiary { background: #fff; color: #555; border: 1px solid #ddd; font-weight: 600; }
        .pp-btn-tertiary:hover { border-color: #111; color: #111; }
        .pp-btn-tertiary.on { color: #dc2626; border-color: #dc2626; background: #fee2e2; }

        /* Seller */
        .pp-seller { border: 1px solid #ececec; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
        .pp-seller-avatar { width: 38px; height: 38px; border-radius: 8px; background: #FFB800; color: #111; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* Trust badges */
        .pp-trust-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .pp-trust-item { display: flex; flex-direction: column; align-items: center; gap: 4px; background: #F8F9FA; border-radius: 10px; padding: 12px 8px; font-size: 11px; font-weight: 600; color: #555; text-align: center; }
        .pp-trust-item span { display: flex; gap: 3px; align-items: center; font-size: 18px; }

        /* Tabs */
        .pp-tabs { margin-top: 24px; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.07); overflow: hidden; }
        .pp-tabs-nav { display: flex; border-bottom: 1px solid #ececec; overflow-x: auto; scrollbar-width: none; }
        .pp-tabs-nav::-webkit-scrollbar { display: none; }
        .pp-tab-btn { background: transparent; border: 0; padding: 16px 20px; font-size: 14px; font-weight: 600; color: #888; cursor: pointer; white-space: nowrap; position: relative; transition: color .12s; }
        .pp-tab-btn:hover { color: #111; }
        .pp-tab-btn.active { color: #111; font-weight: 800; }
        .pp-tab-btn.active::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 3px; background: #FFB800; border-radius: 3px 3px 0 0; }
        .pp-tab-content { padding: 24px; font-size: 14px; color: #555; line-height: 1.7; min-height: 120px; }
        .pp-tab-content p { margin: 0 0 10px; }
        .pp-tab-content ul { padding-left: 20px; margin: 0 0 10px; }
        .pp-spec-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .pp-spec-table tr:nth-child(even) { background: #F8F9FA; }
        .pp-spec-table td { padding: 10px 14px; border-bottom: 1px solid #ececec; }
        .pp-spec-table td:first-child { font-weight: 600; color: #555; width: 160px; }
        .pp-avis-empty { text-align: center; padding: 40px 20px; color: #888; }

        /* Mobile sticky bar */
        .pp-mobile-bar { display: none; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .pp-main { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 768px) {
          .pp-wrap { padding: 0 12px 100px; }
          .pp-main { padding: 16px; border-radius: 12px; }
          .pp-price-current { font-size: 26px; }
          .pp-title { font-size: 17px; }
          .pp-trust-row { grid-template-columns: repeat(3, 1fr); }
          .pp-actions .pp-btn-primary, .pp-actions .pp-btn-secondary { display: none; }
          .pp-mobile-bar {
            display: flex; gap: 10px;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #fff; padding: 10px 14px;
            border-top: 1px solid #ececec;
            box-shadow: 0 -4px 12px rgba(0,0,0,.08);
            z-index: 50;
          }
          .pp-tabs { border-radius: 12px; margin-top: 16px; }
        }
        @media (max-width: 420px) {
          .pp-thumb { width: 52px; height: 52px; }
          .pp-price-current { font-size: 24px; }
          .pp-trust-row { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>

      <div className="pp-wrap">
        {/* Breadcrumb */}
        <nav className="pp-breadcrumb">
          <a href="/">Accueil</a>
          <span className="sep">/</span>
          <a href="/shop">Boutique</a>
          {product.categories[0] && (
            <>
              <span className="sep">/</span>
              <a href={`/categorie/${decodeURIComponent(product.categories[0].slug)}`}>{product.categories[0].name}</a>
            </>
          )}
          <span className="sep">/</span>
          <span className="cur">{product.name}</span>
        </nav>

        {/* Main section */}
        <div className="pp-main">
          {/* Gallery */}
          <div className="pp-gallery">
            <div className="pp-main-img">
              {disc > 0 && <span className="pp-disc-badge">-{disc}%</span>}
              <button
                className={`pp-wish-btn${wished ? ' on' : ''}`}
                onClick={() => setWished(!wished)}
                aria-label="Ajouter aux favoris"
              >
                {wished ? '❤' : '♡'}
              </button>
              {displayImg
                ? <Image src={displayImg} alt={product.name} fill sizes="(max-width: 900px) 100vw, 55vw" style={{ objectFit: 'contain', padding: 20, mixBlendMode: 'multiply' }} />
                : <span style={{ fontSize: 80 }}>📦</span>}
            </div>
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pp-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <Image src={img.src} alt={product.name} width={48} height={48} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pp-info">
            {brand && <span className="pp-brand">● {brand}</span>}
            <h1 className="pp-title">{product.name}</h1>

            <div className="pp-rating-row">
              <Stars value={rating} />
              {rating > 0 && <span className="pp-rating-num">{rating.toFixed(1)}</span>}
              <span className="pp-rating-link">({product.rating_count || 0} avis)</span>
            </div>

            {product.sku && <div className="pp-sku">Réf: <strong>{product.sku}</strong></div>}

            {/* Price block */}
            <div className="pp-price-block">
              <div className="pp-price-row">
                <span className="pp-price-current">
                  {price.toFixed(3)}<span className="pp-price-cur"> TND</span>
                </span>
                {disc > 0 && <span className="pp-price-old">{regular.toFixed(3)} TND</span>}
              </div>
              {savings && (
                <div className="pp-savings">✓ Vous économisez {savings} TND</div>
              )}
            </div>

            {/* Delivery options */}
            <div className="pp-delivery-card">
              <div className="pp-delivery-row active">
                <div className="pp-dlv-ico">📦</div>
                <div className="pp-dlv-label">
                  Livraison standard
                  <small>48–72h — Partout en Tunisie</small>
                </div>
                <div className="pp-dlv-price">10.000 TND</div>
                <div className="pp-dlv-radio" />
              </div>
            </div>

            {/* Stock */}
            <div className={`pp-stock${product.stock_status === 'instock' ? ' in' : ' out'}`}>
              {product.stock_status === 'instock' ? '✓ En stock' : '✗ Rupture de stock'}
            </div>

            {/* Quantity */}
            <div className="pp-qty-wrap">
              <div className="pp-qty-label">Quantité</div>
              <div className="pp-qty">
                <button className="pp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <div className="pp-qty-num">{qty}</div>
                <button className="pp-qty-btn" onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pp-actions">
              <button className={`pp-btn pp-btn-primary${added ? ' added' : ''}`} onClick={handleAdd}>
                {added ? '✓ Ajouté au panier !' : '🛒 Ajouter au panier'}
              </button>
              <a href="/checkout" className="pp-btn pp-btn-secondary" onClick={handleBuyNow}>
                ⚡ Acheter maintenant
              </a>
              <button className={`pp-btn pp-btn-tertiary${wished ? ' on' : ''}`} onClick={() => setWished(!wished)}>
                {wished ? '❤ Dans ma liste' : '♡ Liste de souhaits'}
              </button>
            </div>

            {/* Seller */}
            <div className="pp-seller">
              <div className="pp-seller-avatar">T</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Vendu par <strong>Toprix Official</strong>{' '}
                  <span style={{ color: '#16a34a' }}>✓</span>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>★★★★★ 98% avis positifs</div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="pp-trust-row">
              <div className="pp-trust-item"><span>🔒</span>Paiement sécurisé</div>
              <div className="pp-trust-item"><span>🔄</span>Retour 30 jours</div>
              <div className="pp-trust-item"><span>🚚</span>Livraison rapide</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pp-tabs">
          <div className="pp-tabs-nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`pp-tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="pp-tab-content">
            {activeTab === 'desc' && (
              product.description || product.short_description
                ? <div dangerouslySetInnerHTML={{ __html: product.description || product.short_description }} />
                : <p style={{ color: '#888' }}>Aucune description disponible.</p>
            )}
            {activeTab === 'spec' && (
              <table className="pp-spec-table">
                <tbody>
                  {brand && <tr><td>Marque</td><td>{brand}</td></tr>}
                  {product.categories.map(c => (
                    <tr key={c.id}><td>Catégorie</td><td>{c.name}</td></tr>
                  ))}
                  {product.sku && <tr><td>Référence</td><td>{product.sku}</td></tr>}
                  {product.meta_data
                    ?.filter(m => !m.key.startsWith('_') && m.value && typeof m.value === 'string' && m.value.length < 200)
                    .map(m => (
                      <tr key={m.key}><td>{m.key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</td><td>{m.value}</td></tr>
                    ))
                  }
                  <tr>
                    <td>Disponibilité</td>
                    <td style={{ color: product.stock_status === 'instock' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {product.stock_status === 'instock' ? '✓ En stock' : 'Rupture de stock'}
                    </td>
                  </tr>
                  <tr><td>Prix</td><td>{price.toFixed(3)} TND</td></tr>
                </tbody>
              </table>
            )}
            {activeTab === 'avis' && (
              <div className="pp-avis-empty">
                <div style={{ fontSize: 48 }}>⭐</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12, color: '#111' }}>
                  {product.rating_count > 0 ? `${product.rating_count} avis clients` : 'Aucun avis pour le moment'}
                </div>
                {product.permalink && (
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FFB800', fontWeight: 700, fontSize: 14, marginTop: 12, display: 'inline-block' }}
                  >
                    Voir les avis sur le site officiel →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="pp-mobile-bar">
        <button
          className={`pp-btn pp-btn-primary${added ? ' added' : ''}`}
          onClick={handleAdd}
          style={{ flex: 1 }}
        >
          {added ? '✓ Ajouté !' : '🛒 Ajouter au panier'}
        </button>
        <a
          href="/checkout"
          className="pp-btn pp-btn-secondary"
          style={{ flex: 1 }}
          onClick={handleBuyNow}
        >
          Acheter
        </a>
      </div>
    </>
  );
}
