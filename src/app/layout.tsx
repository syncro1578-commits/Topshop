import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './topshop.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MessengerButton from '@/components/MessengerButton';
import { api } from '@/lib/woocommerce';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Toprix — Meilleurs prix électroménager en Tunisie',
  description: 'Marketplace électroménager n°1 en Tunisie. Meilleurs prix sur réfrigérateurs, friteuses, lave-vaisselle et plus.',
  verification: {
    other: {
      'facebook-domain-verification': '49fmoj954lfdcr8pelq6cgsszapr6m',
    },
  },
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
        {/* Meta Pixel */}
        <Script id="meta-pixel-init" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '28663851839897938');
          fbq('track', 'PageView');
        `}</Script>
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P5N7FR2J" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        {/* Meta Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt="" src="https://www.facebook.com/tr?id=28663851839897938&ev=PageView&noscript=1" />
        </noscript>
        <MessengerButton />
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
