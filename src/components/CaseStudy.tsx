import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/types';
import { asset, displayUrl, projectHref } from '@/lib/paths';
import DeviceMockup from './DeviceMockup';
import { Diagram } from './diagrams/registry';
import { statusText } from './ProjectCard';
import s from './CaseStudy.module.css';

interface NavItem {
  slug: string;
  name: string;
}

interface Props {
  project: Project;
  index: number;
  prev?: NavItem;
  next?: NavItem;
  related?: NavItem[];
  resolve?: (path: string) => string;
}

interface SectionDef {
  id: string;
  title: string;
  node: ReactNode;
}

function Section({ id, no, title, children }: { id: string; no: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-title`}>
      <p className={s.secNo}>{no}</p>
      <h2 id={`${id}-title`} className={s.secTitle}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Arrow({ dir = 'right' }: { dir?: 'right' | 'left' | 'out' }) {
  const d = dir === 'left' ? 'M12 7H3M6.5 3.5 3 7l3.5 3.5' : dir === 'out' ? 'M4 10 10 4M5 4h5v5' : 'M2 7h9M7.5 3.5 11 7l-3.5 3.5';
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function CaseStudy({ project: p, index, prev, next, related = [], resolve = asset }: Props) {
  const no = String(index + 1).padStart(2, '0');
  const sections: SectionDef[] = [];

  if (p.overview.what || p.overview.who || p.overview.problem) {
    sections.push({
      id: 'overview',
      title: 'Overview',
      node: (
        <div className={s.overview}>
          {p.overview.what ? (
            <div>
              <h3>What it is</h3>
              <p>{p.overview.what}</p>
            </div>
          ) : null}
          {p.overview.who ? (
            <div>
              <h3>Who it&apos;s for</h3>
              <p>{p.overview.who}</p>
            </div>
          ) : null}
          {p.overview.problem ? (
            <div>
              <h3>The problem</h3>
              <p>{p.overview.problem}</p>
            </div>
          ) : null}
        </div>
      ),
    });
  }

  if (p.roleDetail.summary || p.roleDetail.items.length) {
    sections.push({
      id: 'role',
      title: 'My role',
      node: (
        <>
          {p.roleDetail.summary ? <p className={s.lead}>{p.roleDetail.summary}</p> : null}
          {p.roleDetail.items.length ? (
            <ul className={s.checks}>
              {p.roleDetail.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          ) : null}
        </>
      ),
    });
  }

  if (p.architecture.diagram || p.architecture.image || p.architecture.components.length) {
    sections.push({
      id: 'architecture',
      title: 'Architecture',
      node: (
        <>
          {p.architecture.diagram || p.architecture.image ? (
            <figure className={s.diagram}>
              <div className="diagram-scroll">
                {p.architecture.diagram ? (
                  <Diagram id={p.architecture.diagram} slug={p.slug} />
                ) : (
                  <img src={resolve(p.architecture.image || '')} alt={`${p.name} architecture diagram`} loading="lazy" decoding="async" />
                )}
              </div>
              <p className={s.scrollHint} aria-hidden="true">
                Drag sideways to see the whole diagram →
              </p>
              {p.architecture.caption ? <figcaption>{p.architecture.caption}</figcaption> : null}
            </figure>
          ) : null}
          {p.architecture.components.length ? (
            <dl className={s.components}>
              {p.architecture.components.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </>
      ),
    });
  }

  if (p.implementation.length) {
    sections.push({
      id: 'implementation',
      title: 'Technical implementation',
      node: (
        <dl className={s.impl}>
          {p.implementation.map((it) => (
            <div key={it.title}>
              <dt>{it.title}</dt>
              <dd>{it.body}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  if (p.decisions.length) {
    sections.push({
      id: 'decisions',
      title: 'Engineering decisions',
      node: (
        <div className={s.decisions}>
          {p.decisions.map((d, i) => (
            <article key={d.title} className={s.decision}>
              <header>
                <span className={s.tag} aria-hidden="true">
                  D{i + 1}
                </span>
                <h3>{d.title}</h3>
              </header>
              <dl>
                {d.context ? (
                  <div>
                    <dt>Context</dt>
                    <dd>{d.context}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Decision</dt>
                  <dd>{d.decision}</dd>
                </div>
                {d.tradeoff ? (
                  <div>
                    <dt>Trade-off</dt>
                    <dd>{d.tradeoff}</dd>
                  </div>
                ) : null}
              </dl>
              {d.code ? (
                <pre className={s.code} dir={d.codeLang === 'arabic' ? 'rtl' : undefined} lang={d.codeLang === 'arabic' ? 'ar' : undefined}>
                  <code>{d.code}</code>
                </pre>
              ) : null}
            </article>
          ))}
        </div>
      ),
    });
  }

  if (p.challenges.length) {
    sections.push({
      id: 'challenges',
      title: 'Challenges & solutions',
      node: (
        <ol className={s.challenges}>
          {p.challenges.map((c) => (
            <li key={c.problem}>
              <div>
                <span className={s.kicker}>Problem</span>
                <p>{c.problem}</p>
              </div>
              <div>
                <span className={s.kicker}>Solution</span>
                <p>{c.solution}</p>
              </div>
            </li>
          ))}
        </ol>
      ),
    });
  }

  if (p.results.status || p.results.metrics.length || p.results.notes.length) {
    sections.push({
      id: 'results',
      title: 'Results & current state',
      node: (
        <>
          {p.results.status ? <p className={s.lead}>{p.results.status}</p> : null}
          {p.results.metrics.length ? (
            <dl className={s.metrics}>
              {p.results.metrics.map((m) => (
                <div key={m.label}>
                  <dd>{m.value}</dd>
                  <dt>{m.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
          {p.results.notes.length ? (
            <ul className={s.notes}>
              {p.results.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
        </>
      ),
    });
  }

  if (p.stack.length) {
    sections.push({
      id: 'stack',
      title: 'Technology stack',
      node: (
        <dl className={s.stack}>
          {p.stack.map((g) => (
            <div key={g.group}>
              <dt>{g.group}</dt>
              <dd>
                <ul className="tags">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  const schematicOnly = !p.visual.desktop && Boolean(p.visual.schematic);

  return (
    <article className={s.page}>
      <header className={`container ${s.hero}`}>
        <nav className={s.crumbs} aria-label="Breadcrumb">
          <Link href="/#work">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {no} · {p.name}
          </span>
        </nav>
        <div className={s.heroGrid}>
          <div>
            <p className="eyebrow">
              <b>{no}</b> {p.category}
            </p>
            <h1 className={s.title}>{p.name}</h1>
            <p className={s.oneLiner}>{p.oneLiner}</p>
            <div className={s.actions}>
              {p.url ? (
                <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener noreferrer">
                  Visit {displayUrl(p.url)}
                  <Arrow dir="out" />
                </a>
              ) : null}
              <Link className="btn" href="/#work">
                <Arrow dir="left" />
                All projects
              </Link>
            </div>
          </div>
          <dl className={s.facts}>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status status-${p.status}`}>{statusText(p)}</span>
              </dd>
            </div>
            {p.role ? (
              <div>
                <dt>Role</dt>
                <dd>{p.role}</dd>
              </div>
            ) : null}
            {p.period ? (
              <div>
                <dt>Period</dt>
                <dd>{p.period}</dd>
              </div>
            ) : null}
            {p.client ? (
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
            ) : null}
            {p.tags.length ? (
              <div>
                <dt>Core stack</dt>
                <dd>{p.tags.join(' · ')}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </header>

      <div className={`container ${s.visualWrap}`}>
        <div className={s.visual}>
          <div className={s.visualInner}>
            <DeviceMockup
              name={p.name}
              desktop={p.visual.desktop}
              mobile={p.visual.mobile}
              schematic={p.visual.schematic}
              mobileSchematic={p.visual.mobileSchematic}
              priority
              resolve={resolve}
            />
          </div>
          {schematicOnly ? (
            <p className={s.visualNote}>
              {p.status === 'private'
                ? 'Schematic, not a screenshot: this system runs as a private deployment on client infrastructure.'
                : 'Schematic, not a screenshot. Screenshots will be added here.'}
            </p>
          ) : null}
        </div>
      </div>

      <div className={`container ${s.layout}`}>
        <aside className={s.toc} aria-label="On this page">
          <p className={s.tocTitle}>On this page</p>
          <ol>
            {sections.map((sec, i) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className={s.content}>
          {sections.map((sec, i) => (
            <Section key={sec.id} id={sec.id} no={String(i + 1).padStart(2, '0')} title={sec.title}>
              {sec.node}
              {sec.id === 'overview' && p.visual.full ? (
                <figure className={s.browser}>
                  <div className={s.browserBar} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <span>{displayUrl(p.url) || p.name}</span>
                  </div>
                  <div className={s.browserBody} tabIndex={0} aria-label={`Full-length screenshot of the ${p.name} homepage. Scroll to see more.`}>
                    <img src={resolve(p.visual.full)} alt={`Full-length screenshot of the ${p.name} homepage`} loading="lazy" decoding="async" width={1200} />
                  </div>
                  <figcaption>The live homepage, full length. Scroll inside the frame.</figcaption>
                </figure>
              ) : null}
            </Section>
          ))}
        </div>
      </div>

      {related.length ? (
        <aside className={`container ${s.related}`} aria-label="Same platform">
          <p className={s.tocTitle}>Built on the same platform</p>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={projectHref(r.slug)} className="link-arrow">
                  {r.name}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <nav className={`container ${s.pager}`} aria-label="More projects">
        {prev ? (
          <Link href={projectHref(prev.slug)} className={s.pagerLink}>
            <span className={s.pagerLabel}>
              <Arrow dir="left" /> Previous
            </span>
            <span className={s.pagerName}>{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        <Link href="/#work" className={`btn ${s.pagerAll}`}>
          Back to projects
        </Link>
        {next ? (
          <Link href={projectHref(next.slug)} className={`${s.pagerLink} ${s.pagerNext}`}>
            <span className={s.pagerLabel}>
              Next <Arrow />
            </span>
            <span className={s.pagerName}>{next.name}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
