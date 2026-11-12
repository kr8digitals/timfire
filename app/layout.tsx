import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header, Footer } from '@/components/site/chrome';
import { getContent } from '@/lib/cms/store';
import { safeUrl } from '@/lib/safe';
import { SITE_URL } from '@/lib/site';

const display = localFont({
  src: './fonts/display-latin.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '400 700',
  preload: true,
});
const body = localFont({
  src: './fonts/body-latin.woff2',
  variable: '--font-body',
  display: 'swap',
  weight: '400 600',
  preload: true,
});
const serif = localFont({
  src: './fonts/editorial.woff2',
  variable: '--font-editorial',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TIMFIRE — websites & AI agents, built to work',
    template: '%s | TIMFIRE',
  },
  description:
    'Kenneth Timothy Iziogo — TIMFIRE. Websites and AI agents built for speed, clarity and enquiries. Founder of KR8 DIGITALS, Abakaliki, Nigeria.',
  applicationName: 'TIMFIRE',
  authors: [{ name: 'Kenneth Timothy Iziogo', url: `${SITE_URL}/about` }],
  creator: 'TIMFIRE',
  publisher: 'TIMFIRE',
  alternates: { canonical: '/' },
  keywords: [
    'TIMFIRE',
    'Kenneth Timothy Iziogo',
    'website developer Nigeria',
    'AI agent developer',
    'KR8 DIGITALS',
    'web design Abakaliki',
    'Next.js developer Nigeria',
  ],
  openGraph: {
    type: 'website',
    siteName: 'TIMFIRE',
    locale: 'en_NG',
    url: SITE_URL,
    title: 'TIMFIRE — websites & AI agents, built to work',
    description:
      'Websites and AI agents built for speed, clarity and enquiries. Founded KR8 DIGITALS. Based in Abakaliki, working anywhere.',
    images: [{ url: '/images/og.jpg', width: 1200, height: 630, alt: 'TIMFIRE in an orange jacket' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIMFIRE — websites & AI agents, built to work',
    description: 'Websites and AI agents built for speed, clarity and enquiries.',
    images: ['/images/og.jpg'],
  },
  robots:
    process.env.VERCEL_ENV === 'preview'
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#0b0706',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  const socials = content.settings.socials
    .filter((s) => s.isPublic && safeUrl(s.url))
    .map((s) => ({ name: s.name, url: safeUrl(s.url) }));

  return (
    <html lang="en-NG" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer socials={socials} />
      </body>
    </html>
  );
}
