/** Path prefix when the site is served from a sub-folder, e.g. "/portfolio". Empty for username.github.io. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Public URL of the deployed site, including the base path. Set by the deploy workflow. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Prefixes a public file path (e.g. /projects/x.webp) with the base path. External and data URLs pass through. */
export function asset(path?: string): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:|mailto:)/.test(path)) return path;
  return BASE_PATH + (path.startsWith('/') ? path : `/${path}`);
}

/** Absolute URL for metadata, sitemaps and structured data. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:/.test(path)) return path;
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`);
}

export function projectHref(slug: string): string {
  return `/projects/${slug}/`;
}

export function displayUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/** File name offered when the CV is downloaded, e.g. Ghaith-Audi-CV.pdf */
export function cvFileName(name: string): string {
  return `${name.trim().replace(/\s+/g, '-')}-CV.pdf`;
}
