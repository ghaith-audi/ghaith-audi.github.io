import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WorkSection from '@/components/WorkSection';
import { ApproachSection, ContactSection, ExperienceSection, StackSection } from '@/components/HomeSections';
import Footer from '@/components/Footer';
import { getProjects, getSite, publicFileExists } from '@/lib/content';
import { absoluteUrl, asset } from '@/lib/paths';

export default function HomePage() {
  const site = getSite();
  const projects = getProjects();
  const cvHref = publicFileExists(site.cv) ? asset(site.cv) : undefined;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: 'Software engineer',
    description: site.seo.description,
    url: absoluteUrl('/'),
    image: absoluteUrl(site.portrait),
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: site.location.split(',')[0]?.trim(), addressCountry: 'SY' },
    sameAs: [site.linkedin, site.github].filter(Boolean),
    knowsLanguage: ['ar', 'en'],
    knowsAbout: site.stack.groups.flatMap((g) => g.items).slice(0, 20),
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header name={site.name} subtitle="Software engineer" cvHref={cvHref} />
      <main id="main">
        <Hero site={site} cvHref={cvHref} />
        <WorkSection site={site} projects={projects} />
        <ApproachSection site={site} />
        <ExperienceSection site={site} />
        <StackSection site={site} />
        <ContactSection site={site} cvHref={cvHref} />
      </main>
      <Footer site={site} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
    </>
  );
}
