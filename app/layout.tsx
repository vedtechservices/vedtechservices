import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vedtechservices.in'),
  title: 'VedTech Services',
  description: 'IT services and technology solutions from VedTech Services.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
