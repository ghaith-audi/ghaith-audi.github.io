import type { Site } from '@/lib/types';
import s from './Footer.module.css';

export default function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  return (
    <footer className={s.footer}>
      <div className={`container ${s.inner}`}>
        <p className={s.sig}>
          <b>{site.name}</b>
          <span>{site.footer.note}</span>
        </p>
        <nav className={s.links} aria-label="Elsewhere">
          <a href={`mailto:${site.email}`}>Email</a>
          {site.linkedin ? (
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : null}
          {site.github ? (
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          ) : null}
          <a href="#top">Back to top ↑</a>
        </nav>
        <p className={s.copy}>© {year}</p>
      </div>
    </footer>
  );
}
