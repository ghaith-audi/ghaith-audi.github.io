import type { Site } from '@/lib/types';
import CopyButton from './CopyButton';
import { cvFileName } from '@/lib/paths';
import s from './HomeSections.module.css';

export function ApproachSection({ site }: { site: Site }) {
  const { approach } = site;
  if (!approach.steps.length) return null;
  return (
    <section id="approach" className="section" aria-labelledby="approach-title">
      <div className="container">
        <header className="sec-head">
          <div>
            <p className="eyebrow">
              <b>03</b> Process
            </p>
            <h2 id="approach-title" className="sec-title">
              {approach.title}
            </h2>
          </div>
          {approach.lead ? <p className="sec-lead">{approach.lead}</p> : null}
        </header>
        <ol className={s.steps}>
          {approach.steps.map((st, i) => (
            <li key={st.title} className={s.step}>
              <span className={s.stepNo}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={s.stepTitle}>{st.title}</h3>
              <p className={s.stepBody}>{st.body}</p>
              {st.example ? <p className={s.stepExample}>{st.example}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ExperienceSection({ site }: { site: Site }) {
  const { experience } = site;
  if (!experience.items.length) return null;
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <header className="sec-head">
          <div>
            <p className="eyebrow">
              <b>04</b> Timeline
            </p>
            <h2 id="experience-title" className="sec-title">
              {experience.title}
            </h2>
          </div>
          {experience.lead ? <p className="sec-lead">{experience.lead}</p> : null}
        </header>
        <ol className={s.timeline}>
          {experience.items.map((it) => (
            <li key={`${it.org}-${it.period}`} className={s.entry}>
              <div className={s.when}>
                <span>{it.period}</span>
                {it.location ? <small>{it.location}</small> : null}
              </div>
              <div className={s.what}>
                <h3>
                  {it.org}
                  <span>{it.role}</span>
                </h3>
                {it.bullets.length ? (
                  <ul>
                    {it.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function StackSection({ site }: { site: Site }) {
  const { stack } = site;
  if (!stack.groups.length) return null;
  return (
    <section id="stack" className="section" aria-labelledby="stack-title">
      <div className="container">
        <header className="sec-head">
          <div>
            <p className="eyebrow">
              <b>05</b> Tools
            </p>
            <h2 id="stack-title" className="sec-title">
              {stack.title}
            </h2>
          </div>
          {stack.lead ? <p className="sec-lead">{stack.lead}</p> : null}
        </header>
        <dl className={s.stack}>
          {stack.groups.map((g) => (
            <div key={g.group} className={s.group}>
              <dt>{g.group}</dt>
              <dd>
                {g.items.map((item, i) => (
                  <span key={item}>
                    {item}
                    {i < g.items.length - 1 ? <i aria-hidden="true"> · </i> : null}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ContactSection({ site, cvHref }: { site: Site; cvHref?: string }) {
  const { contact } = site;
  return (
    <section id="contact" className={s.contact} aria-labelledby="contact-title">
      <div className={`container ${s.contactInner}`}>
        <div className={s.contactMain}>
          <span className={s.stamp}>Issued for hire</span>
          <p className="eyebrow">
            <b>06</b> {contact.eyebrow}
          </p>
          <h2 id="contact-title" className={s.contactTitle}>
            {contact.title}
          </h2>
          <p className={s.contactBody}>{contact.body}</p>
          <div className={s.contactCta}>
            <a className="btn btn-primary" href={`mailto:${site.email}`}>
              {contact.button}
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 7h9M7.5 3.5 11 7l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
          </div>
          {contact.note ? <p className={s.contactNote}>{contact.note}</p> : null}
        </div>
        <ul className={s.channels}>
          <li>
            <span className={s.channelLabel}>Email</span>
            <a className={s.channelValue} href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <CopyButton text={site.email} className={s.channelAction} />
          </li>
          {site.linkedin ? (
            <li>
              <span className={s.channelLabel}>LinkedIn</span>
              <a className={s.channelValue} href={site.linkedin} target="_blank" rel="noopener noreferrer">
                {site.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
              <span className={s.channelAction} aria-hidden="true">
                ↗
              </span>
            </li>
          ) : null}
          {site.github ? (
            <li>
              <span className={s.channelLabel}>GitHub</span>
              <a className={s.channelValue} href={site.github} target="_blank" rel="noopener noreferrer">
                {site.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
              <span className={s.channelAction} aria-hidden="true">
                ↗
              </span>
            </li>
          ) : null}
          {cvHref ? (
            <li>
              <span className={s.channelLabel}>CV</span>
              <a className={s.channelValue} href={cvHref} download={cvFileName(site.name)}>
                Download PDF
              </a>
              <span className={s.channelAction} aria-hidden="true">
                ↓
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
