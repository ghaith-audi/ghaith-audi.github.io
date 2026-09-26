import type { Site } from '@/lib/types';
import { asset, cvFileName } from '@/lib/paths';
import s from './Hero.module.css';

export default function Hero({ site, cvHref }: { site: Site; cvHref?: string }) {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={`container ${s.grid}`}>
        <div className={s.copy}>
          <p className="eyebrow">
            <b>01</b> Portfolio · {site.location}
          </p>
          <h1 id="hero-title" className={s.name}>
            <span>{site.firstName}</span>
            <span>{site.lastName}</span>
          </h1>
          <p className={s.roles}>
            {site.roles.map((r, i) => (
              <span key={r} className={i === site.roles.length - 1 ? s.hot : undefined}>
                {r}
              </span>
            ))}
          </p>
          <p className={s.tagline}>{site.tagline}</p>
          <div className={s.cta}>
            <a className="btn btn-primary" href="#work">
              View projects
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M7 2v9M3.5 7.5 7 11l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
            {cvHref ? (
              <a className="btn" href={cvHref} download={cvFileName(site.name)}>
                Download CV
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M7 1.5v8M3.5 6 7 9.5 10.5 6M2 12.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </a>
            ) : (
              <a className="btn" href="#contact">
                Get in touch
              </a>
            )}
          </div>
          {site.available ? (
            <p className={s.status}>
              <span className={s.dot} aria-hidden="true" />
              {site.availability}
            </p>
          ) : null}
        </div>

        <figure className={s.fig}>
          <div className={s.dimH} aria-hidden="true">
            <i />
            <b>
              {site.location} · {site.timezone}
            </b>
            <i />
          </div>
          <div className={s.dimV} aria-hidden="true">
            <i />
            <b>{site.languages}</b>
            <i />
          </div>
          <div className={s.photo}>
            <img src={asset(site.portrait)} alt={site.portraitAlt} width={800} height={800} fetchPriority="high" decoding="async" />
            <span className={`${s.cross} ${s.crossA}`} aria-hidden="true" />
            <span className={`${s.cross} ${s.crossB}`} aria-hidden="true" />
          </div>
          <figcaption className={s.caption}>
            <span>Fig. 1 · {site.name}</span>
            <span>Scale 1:1</span>
          </figcaption>
        </figure>
      </div>

      {site.heroFacts.length ? (
        <div className="container">
          <dl className={s.facts}>
            {site.heroFacts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
