import type { Metadata } from 'next';
import Script from 'next/script';
  import '../src/index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vedtechservices.in'),
  title: 'VedTech Services',
  icons: {
    icon: '/icon.png',
  },
  description: 'IT services and technology solutions from VedTech Services.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}
        
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L94R3KB3DH"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', 'G-L94R3KB3DH');
        `}
      </Script>

      </body>
    </html>
  );
}
