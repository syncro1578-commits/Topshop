import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './topshop.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/woocommerce';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Toprix — Meilleurs prix électroménager en Tunisie',
  description: 'Marketplace électroménager n°1 en Tunisie. Meilleurs prix sur réfrigérateurs, friteuses, lave-vaisselle et plus.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await api.categories.top(8).catch(() => []);

  return (
    <html lang="fr">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-P5N7FR2J');
        `}</Script>
        {/* Google Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-965FZFQYSS" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-965FZFQYSS');
        `}</Script>
        {/* Facebook Messenger Chat Plugin */}
        <Script id="fb-customerchat-init" strategy="afterInteractive">{`
          window.fbAsyncInit = function() {
            FB.init({ xfbml: true, version: 'v21.0' });
          };
        `}</Script>
        <Script async defer src="https://connect.facebook.net/fr_FR/sdk/xfbml.customerchat.js" strategy="afterInteractive" />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P5N7FR2J" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        {/* Facebook Messenger Chat Plugin */}
        <div id="fb-root"></div>
        <div
          dangerouslySetInnerHTML={{
            __html: '<div class="fb-customerchat" attribution="setup_tool" page_id="1299621413240558"></div>',
          }}
        />
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
