import type { Project, Site } from './types';

// Content files are edited by hand and through the dashboard. Normalising them
// here means a missing field never crashes the build or the preview.

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const strArr = (v: unknown): string[] => arr<unknown>(v).filter((x): x is string => typeof x === 'string');

export function normalizeProject(raw: Partial<Project>, fallbackSlug = ''): Project {
  const r = raw ?? {};
  const status = r.status === 'live' || r.status === 'pilot' || r.status === 'private' ? r.status : 'private';
  return {
    slug: str(r.slug, fallbackSlug),
    order: typeof r.order === 'number' ? r.order : 999,
    featured: Boolean(r.featured),
    name: str(r.name, fallbackSlug),
    category: str(r.category),
    summary: str(r.summary),
    oneLiner: str(r.oneLiner),
    status,
    url: str(r.url),
    period: str(r.period),
    client: str(r.client),
    role: str(r.role),
    tags: strArr(r.tags),
    visual: {
      desktop: str(r.visual?.desktop),
      mobile: str(r.visual?.mobile),
      full: str(r.visual?.full),
      schematic: str(r.visual?.schematic),
      mobileSchematic: str(r.visual?.mobileSchematic),
    },
    overview: {
      what: str(r.overview?.what),
      who: str(r.overview?.who),
      problem: str(r.overview?.problem),
    },
    roleDetail: {
      summary: str(r.roleDetail?.summary),
      items: strArr(r.roleDetail?.items),
    },
    architecture: {
      diagram: str(r.architecture?.diagram),
      image: str(r.architecture?.image),
      caption: str(r.architecture?.caption),
      components: arr<{ title?: string; body?: string }>(r.architecture?.components).map((c) => ({
        title: str(c?.title),
        body: str(c?.body),
      })),
    },
    implementation: arr<{ title?: string; body?: string }>(r.implementation).map((c) => ({
      title: str(c?.title),
      body: str(c?.body),
    })),
    decisions: arr<Record<string, unknown>>(r.decisions).map((d) => ({
      title: str(d?.title),
      context: str(d?.context),
      decision: str(d?.decision),
      tradeoff: str(d?.tradeoff),
      code: str(d?.code),
      codeLang: str(d?.codeLang),
    })),
    challenges: arr<Record<string, unknown>>(r.challenges).map((c) => ({
      problem: str(c?.problem),
      solution: str(c?.solution),
    })),
    results: {
      status: str(r.results?.status),
      metrics: arr<Record<string, unknown>>(r.results?.metrics).map((m) => ({ value: str(m?.value), label: str(m?.label) })),
      notes: strArr(r.results?.notes),
    },
    stack: arr<Record<string, unknown>>(r.stack).map((g) => ({ group: str(g?.group), items: strArr(g?.items) })),
    related: strArr(r.related),
    seo: { title: str(r.seo?.title), description: str(r.seo?.description) },
  };
}

export function normalizeSite(raw: Partial<Site>): Site {
  const r = raw ?? {};
  return {
    name: str(r.name, 'Ghaith Audi'),
    firstName: str(r.firstName, 'Ghaith'),
    lastName: str(r.lastName, 'Audi'),
    roles: strArr(r.roles),
    tagline: str(r.tagline),
    location: str(r.location),
    timezone: str(r.timezone),
    availability: str(r.availability),
    available: r.available !== false,
    languages: str(r.languages),
    email: str(r.email),
    linkedin: str(r.linkedin),
    github: str(r.github),
    cv: str(r.cv),
    portrait: str(r.portrait),
    portraitAlt: str(r.portraitAlt, 'Portrait'),
    heroFacts: arr<Record<string, unknown>>(r.heroFacts).map((m) => ({ value: str(m?.value), label: str(m?.label) })),
    work: { title: str(r.work?.title, 'Selected work'), lead: str(r.work?.lead) },
    approach: {
      title: str(r.approach?.title, 'How I build software'),
      lead: str(r.approach?.lead),
      steps: arr<Record<string, unknown>>(r.approach?.steps).map((s) => ({
        title: str(s?.title),
        body: str(s?.body),
        example: str(s?.example),
      })),
    },
    experience: {
      title: str(r.experience?.title, 'Experience'),
      lead: str(r.experience?.lead),
      items: arr<Record<string, unknown>>(r.experience?.items).map((e) => ({
        period: str(e?.period),
        org: str(e?.org),
        role: str(e?.role),
        location: str(e?.location),
        bullets: strArr(e?.bullets),
      })),
    },
    stack: {
      title: str(r.stack?.title, 'Technical stack'),
      lead: str(r.stack?.lead),
      groups: arr<Record<string, unknown>>(r.stack?.groups).map((g) => ({ group: str(g?.group), items: strArr(g?.items) })),
    },
    contact: {
      eyebrow: str(r.contact?.eyebrow, 'Contact'),
      title: str(r.contact?.title, 'Have a system to build?'),
      body: str(r.contact?.body),
      button: str(r.contact?.button, "Let's talk"),
      note: str(r.contact?.note),
    },
    footer: { note: str(r.footer?.note) },
    seo: {
      title: str(r.seo?.title, str(r.name, 'Portfolio')),
      description: str(r.seo?.description),
      keywords: strArr(r.seo?.keywords),
    },
  };
}
