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
  description: 'A tool for AI coding assistants that analyzes prompt and task quality, scores them, and generates an improved prompt template.',
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
    locale: 'en_US',
    title: 'AI Task & Prompt Linter',
    description: 'Analyze prompt and task quality with a rubric and get repo-aware recommendations with Agent Mode.',
    url: '/',
    siteName: 'AI Task & Prompt Linter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Task & Prompt Linter',
    description: 'Analyze prompt and task quality and generate an improved prompt template.',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
