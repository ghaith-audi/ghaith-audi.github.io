import fs from 'node:fs';
import path from 'node:path';
import type { Project, Site } from './types';
import { normalizeProject, normalizeSite } from './normalize';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function getSite(): Site {
  return normalizeSite(readJson<Partial<Site>>(path.join(CONTENT_DIR, 'site.json')));
}

export function getProjects(): Project[] {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => normalizeProject(readJson<Partial<Project>>(path.join(PROJECTS_DIR, f)), f.replace(/\.json$/, '')))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

/** True when a file referenced by content (e.g. the CV) actually exists in /public. */
export function publicFileExists(publicPath?: string): boolean {
  if (!publicPath || /^https?:/.test(publicPath)) return Boolean(publicPath);
  return fs.existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));
}
