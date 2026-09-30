/**
 * Bouton flottant "Discuter sur Messenger" — solution de secours pendant que
 * le widget Facebook Customer Chat integre (voir layout.tsx) est indisponible
 * cote serveurs Meta (xfbml.customerchat.js renvoie 500 depuis des semaines).
 * Aucune dependance au SDK Facebook : simple lien vers m.me, fonctionne
 * toujours. A retirer si le widget integre redevient fonctionnel.
 */
const MESSENGER_URL = 'https://m.me/1299621413240558';

export default function MessengerButton() {
  return (
    <a
      href={MESSENGER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur Messenger"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#0084FF',
        color: '#fff',
        padding: '12px 18px',
        borderRadius: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        textDecoration: 'none',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M18 0C8.06 0 0 7.44 0 16.62c0 5.23 2.63 9.9 6.74 12.95V36l6.16-3.38c1.64.45 3.38.7 5.1.7 9.94 0 18-7.44 18-16.62S27.94 0 18 0Z"
          fill="#fff"
        />
        <path
          d="M18 1.4C8.83 1.4 1.4 8.28 1.4 16.62c0 4.77 2.42 9.02 6.2 11.8l.62.46v6.2l5.67-3.11.5.14c1.15.32 2.36.5 3.61.5 9.17 0 16.6-6.88 16.6-15.99C34.6 8.28 27.17 1.4 18 1.4Z"
          fill="#0084FF"
        />
        <path
          d="m8.4 21.6 5.4-8.4 4.3 4.32 5.62-4.32-5.5 8.3-4.27-4.3-5.55 4.4Z"
          fill="#fff"
        />
      </svg>
      Discuter sur Messenger
    </a>
  );
}
