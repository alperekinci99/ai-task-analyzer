import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import GoogleAnalytics from '@/components/GoogleAnalytics';

import './globals.css';

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'AI Task & Prompt Linter',
    template: '%s | AI Task & Prompt Linter',
  },
  description: 'AI coding asistanları için prompt/task kalitesini analiz eden, skorlayan ve iyileştirilmiş prompt şablonu üreten araç.',
  applicationName: 'AI Task & Prompt Linter',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    title: 'AI Task & Prompt Linter',
    description: 'Prompt/task kalitesini rubric ile analiz edin; Agent Mode ile repo-aware öneriler alın.',
    url: '/',
    siteName: 'AI Task & Prompt Linter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Task & Prompt Linter',
    description: 'Prompt/task kalitesini analiz eden ve iyileştirilmiş prompt şablonu üreten araç.',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
