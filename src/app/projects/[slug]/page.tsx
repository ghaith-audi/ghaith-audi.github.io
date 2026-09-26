import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseStudy from '@/components/CaseStudy';
import { getProjects, getSite, publicFileExists } from '@/lib/content';
import { absoluteUrl, asset, projectHref } from '@/lib/paths';

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjects().find((x) => x.slug === slug);
  if (!p) return {};
  const title = p.seo?.title || `${p.name} · ${p.category}`;
  const description = p.seo?.description || p.summary;
  const image = p.visual.desktop ? absoluteUrl(p.visual.desktop) : absoluteUrl('/og.png');
  const url = absoluteUrl(projectHref(p.slug));
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const site = getSite();
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const prev = index > 0 ? projects[index - 1] : undefined;
  const next = index < projects.length - 1 ? projects[index + 1] : undefined;
  const related = (project.related || [])
    .map((r) => projects.find((p) => p.slug === r))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ slug: p.slug, name: p.name }));
  const cvHref = publicFileExists(site.cv) ? asset(site.cv) : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    headline: project.oneLiner,
    description: project.summary,
    url: absoluteUrl(projectHref(project.slug)),
    creator: { '@type': 'Person', name: site.name, url: absoluteUrl('/') },
    keywords: project.tags.join(', '),
    ...(project.url ? { sameAs: project.url } : {}),
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header name={site.name} subtitle="Software engineer" cvHref={cvHref} />
      <main id="main">
        <CaseStudy
          project={project}
          index={index}
          prev={prev ? { slug: prev.slug, name: prev.name } : undefined}
          next={next ? { slug: next.slug, name: next.name } : undefined}
          related={related}
        />
      </main>
      <Footer site={site} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
