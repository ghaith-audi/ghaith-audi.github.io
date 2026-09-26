import type { Metadata, Viewport } from 'next';
import { Archivo, Martian_Mono, Noto_Kufi_Arabic } from 'next/font/google';
import { getSite } from '@/lib/content';
import { SITE_URL, absoluteUrl } from '@/lib/paths';
import DiagramDefs from '@/components/diagrams/DiagramDefs';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const martian = Martian_Mono({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-martian',
  display: 'swap',
});

const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-kufi',
  display: 'swap',
  preload: false,
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: {
    default: site.seo.title,
    template: `%s · ${site.name}`,
  },
  description: site.seo.description,
  keywords: site.seo.keywords,
  authors: [{ name: site.name, url: absoluteUrl('/') }],
  creator: site.name,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630, alt: site.seo.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: [absoluteUrl('/og.png')],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef1ec' },
    { media: '(prefers-color-scheme: dark)', color: '#0b2640' },
  ],
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${martian.variable} ${kufi.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <DiagramDefs />
        {children}
      </body>
    </html>
  );
}
