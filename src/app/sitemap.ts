import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/content';
import { absoluteUrl, projectHref } from '@/lib/paths';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...getProjects().map((p) => ({
      url: absoluteUrl(projectHref(p.slug)),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
