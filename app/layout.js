import './globals.css';
import { getLang } from '@/lib/i18n';

export const metadata = { title: 'Gomrok · Equipment Maintenance', robots: { index: false, follow: false } };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@700;800&family=Inter:wght@400;500;600;700&family=Tektur:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
