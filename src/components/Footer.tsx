import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="inner">
        <div className="grid">
          <div className="brand-block">
            <div className="logo">topshop<span className="dot">.</span></div>
            <p style={{ marginTop: 14 }}>
              Le marketplace tech en Tunisie. Smartphones, laptops, audio, gaming,
              maison — livrés chez vous.
            </p>
            <div className="pay-row">
              <span className="pay">VISA</span>
              <span className="pay">MASTERCARD</span>
              <span className="pay">D17</span>
              <span className="pay">POSTE TN</span>
              <span className="pay" style={{ background: '#FFB800' }}>CASH</span>
            </div>
          </div>
          <div>
            <h4>Service client</h4>
            <ul>
              <li><Link href="/suivi-commande">Suivre ma commande</Link></li>
              <li><Link href="/retours">Retours &amp; remboursements</Link></li>
              <li><Link href="/livraison">Modes de livraison</Link></li>
              <li><Link href="/contact">Contactez-nous</Link></li>
            </ul>
          </div>
          <div>
            <h4>À propos de Topshop</h4>
            <ul>
              <li><Link href="/a-propos">Qui sommes-nous</Link></li>
              <li><Link href="/shop">Nos produits</Link></li>
              <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
              <li><Link href="/account">Mon compte</Link></li>
            </ul>
          </div>
          <div>
            <h4>Suivez-nous</h4>
            <ul>
              <li><a href="https://www.facebook.com/profile.php?id=61594466673346" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/topshop.tn" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@topshop.tn" target="_blank" rel="noopener noreferrer">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div>© {new Date().getFullYear()} Topshop.tn — Tous droits réservés. Tunisie.</div>
          <div className="links">
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/retours">Conditions de retour</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
