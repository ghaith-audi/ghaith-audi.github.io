'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { cvFileName } from '@/lib/paths';
import s from './Header.module.css';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
];

interface Props {
  name: string;
  subtitle: string;
  cvHref?: string;
}

export default function Header({ name, subtitle, cvHref }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header id="top" className={s.header}>
      <div className={`container ${s.inner}`}>
        <Link href="/" className={s.brand} onClick={() => setOpen(false)}>
          <span className={s.mark} aria-hidden="true">
            {initials}
          </span>
          <span className={s.brandText}>
            <b>{name}</b>
            <small>{subtitle}</small>
          </span>
        </Link>

        <nav className={s.nav} aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.id} href={`/#${l.id}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={s.tools}>
          <ThemeToggle className={s.theme} />
          {cvHref ? (
            <a className={`btn ${s.cta}`} href={cvHref} download={cvFileName(name)}>
              Download CV
            </a>
          ) : (
            <Link className={`btn ${s.cta}`} href="/#contact">
              Let&apos;s talk
            </Link>
          )}
          <button
            type="button"
            className={s.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={s.burger} aria-hidden="true" data-open={open} />
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={s.mobile} hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul className={s.mobileList}>
            {LINKS.map((l, i) => (
              <li key={l.id}>
                <Link href={`/#${l.id}`} onClick={() => setOpen(false)}>
                  <span className={s.mobileNo}>{String(i + 1).padStart(2, '0')}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={s.mobileTools}>
            {cvHref ? (
              <a className="btn btn-primary" href={cvHref} download={cvFileName(name)}>
                Download CV
              </a>
            ) : null}
            <ThemeToggle className="btn" />
          </div>
        </nav>
      </div>
    </header>
  );
}
