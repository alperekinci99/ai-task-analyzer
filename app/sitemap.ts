import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = siteUrl ? siteUrl.replace(/\/$/, '') : '';

  const now = new Date();

  return [
    {
      url: baseUrl ? `${baseUrl}/` : '/',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
