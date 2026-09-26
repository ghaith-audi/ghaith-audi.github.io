import type { Project, Site } from '@/lib/types';
import ProjectCard from './ProjectCard';
import s from './WorkSection.module.css';

/** Decides which cards span the full row so no card is ever left alone in a row. */
export function wideLayout(projects: Project[]): boolean[] {
  const wide = projects.map(() => false);
  let waiting = -1;
  projects.forEach((p, i) => {
    if (p.featured) {
      if (waiting >= 0) wide[waiting] = true;
      waiting = -1;
      wide[i] = true;
    } else if (waiting >= 0) {
      waiting = -1;
    } else {
      waiting = i;
    }
  });
  if (waiting >= 0) wide[waiting] = true;
  return wide;
}

export default function WorkSection({ site, projects }: { site: Site; projects: Project[] }) {
  const wide = wideLayout(projects);
  const live = projects.filter((p) => p.status !== 'private').length;
  const priv = projects.length - live;
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="container">
        <header className="sec-head">
          <div>
            <p className="eyebrow">
              <b>02</b> {projects.length} projects
            </p>
            <h2 id="work-title" className="sec-title">
              {site.work.title}
            </h2>
          </div>
          <div>
            <p className="sec-lead">{site.work.lead}</p>
            <p className={s.legend}>
              <span className="status status-live">{live} live</span>
              <span className="status status-private">{priv} private deployments</span>
            </p>
          </div>
        </header>
        <div className={s.grid}>
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} wide={wide[i]} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
