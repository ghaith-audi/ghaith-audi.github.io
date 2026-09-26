import type { MetadataRoute } from 'next';
import { absoluteUrl, BASE_PATH } from '@/lib/paths';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: [`${BASE_PATH}/admin/`] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
