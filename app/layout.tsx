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
  description:
    'Analyze AI coding prompts, developer task specs, and prompt engineering instructions. Score prompt quality, improve clarity, and generate an optimized prompt for coding agents.',
  applicationName: 'AI Task & Prompt Linter',
  keywords: [
    'AI prompt analyzer',
    'prompt linter',
    'prompt engineering tool',
    'AI coding prompt',
    'developer prompt checker',
    'task specification analyzer',
    'agent mode prompt',
    'prompt quality score',
    'AI task linter',
    'coding assistant prompt',
  ],
  authors: [{ name: 'Alper Ekinci', url: 'https://github.com/alperekinci99' }],
  creator: 'Alper Ekinci',
  publisher: 'AI Task & Prompt Linter',
  referrer: 'origin-when-cross-origin',
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
    title: 'AI Task & Prompt Linter for Developers',
    description:
      'Analyze AI prompts, developer task descriptions, and coding agent instructions with rubric-based scoring and optimized prompt generation.',
    url: '/',
    siteName: 'AI Task & Prompt Linter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Task & Prompt Linter for Developers',
    description:
      'Score and improve AI coding prompts, developer task specs, and agent instructions with an optimized prompt output.',
  },
  verification: {
    google: '-Q1L_sTtdLx0eF59NkEAazsfxF9wcc8ug87I8vzA_Cc',
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
