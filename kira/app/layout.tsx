// app/layout.tsx — root layout.
import type { Metadata, Viewport } from 'next';
import { Anton, Archivo_Black, Space_Grotesk, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { defaultMetadata } from '@/lib/seo';
import { MobileTabBar } from '@/components/MobileTabBar';

const anton       = Anton({ subsets: ['latin'], weight: '400', variable: '--font-hit' });
const archivoBlack = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-ui' });
const notoJP      = Noto_Sans_JP({ subsets: ['latin'], weight: ['400','700','900'], variable: '--font-jp', preload: false });
const jetMono     = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-mono' });

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = { themeColor: '#050507', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${archivoBlack.variable} ${spaceGrotesk.variable} ${notoJP.variable} ${jetMono.variable}`}>
      <body className="min-h-screen pb-24">
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
