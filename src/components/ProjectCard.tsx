import Link from 'next/link';
import type { Project } from '@/lib/types';
import { asset, displayUrl, projectHref } from '@/lib/paths';
import DeviceMockup from './DeviceMockup';
import s from './ProjectCard.module.css';

export function statusText(p: Project): string {
  if (p.status === 'private') return 'Private deployment';
  const where = displayUrl(p.url);
  const label = p.status === 'pilot' ? 'Live pilot' : 'Live';
  return where ? `${label} · ${where}` : label;
}

interface Props {
  project: Project;
  index: number;
  wide?: boolean;
  priority?: boolean;
  resolve?: (path: string) => string;
}

export default function ProjectCard({ project: p, index, wide = false, priority = false, resolve = asset }: Props) {
  const usesSchematic = !p.visual.desktop && Boolean(p.visual.schematic);
  const no = String(index + 1).padStart(2, '0');
  return (
    <article className={`${s.card} ${wide ? s.wide : ''} device-hover`}>
      <div className={s.visual}>
        <div className={s.visualInner}>
          <DeviceMockup
            name={p.name}
            desktop={p.visual.desktop}
            mobile={p.visual.mobile}
            schematic={p.visual.schematic}
            mobileSchematic={p.visual.mobileSchematic}
            priority={priority}
            resolve={resolve}
          />
        </div>
        {usesSchematic ? (
          <span className={s.visualTag}>{p.status === 'private' ? 'Schematic · no public screenshots' : 'Schematic'}</span>
        ) : null}
      </div>
      <div className={s.body}>
        <div className={s.meta}>
          <span className={s.no}>{no}</span>
          <span className={`status status-${p.status}`}>{statusText(p)}</span>
        </div>
        <h3 className={s.title}>
          <Link href={projectHref(p.slug)} className={s.link}>
            {p.name}
            <span className="sr-only">, case study</span>
          </Link>
        </h3>
        <p className={s.category}>{p.category}</p>
        <p className={s.summary}>{p.summary}</p>
        {p.tags.length ? (
          <ul className="tags" aria-label="Core technologies">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <span className={`link-arrow ${s.cta}`} aria-hidden="true">
          View case study
          <svg viewBox="0 0 14 14">
            <path d="M2 7h9M7.5 3.5 11 7l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      </div>
    </article>
  );
}
