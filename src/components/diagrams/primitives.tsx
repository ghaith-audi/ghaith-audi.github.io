import type { ReactNode } from 'react';

type Tone = 'bx' | 'bx2' | 'bxr' | 'bxh' | 'bxd';

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  sub?: string | string[];
  tone?: Tone;
  align?: 'middle' | 'start';
  /** Larger line spacing, used by the device-screen schematics */
  lg?: boolean;
}

/** A labelled rectangle with its text vertically centred. */
export function Box({ x, y, w, h, title, sub, tone = 'bx', align = 'middle', lg = false }: BoxProps) {
  const subs = Array.isArray(sub) ? sub : sub ? [sub] : [];
  const titleLine = lg ? 20 : 16;
  const subLine = lg ? 17 : 14;
  const block = (title ? titleLine : 0) + subs.length * subLine;
  const top = y + (h - block) / 2;
  const tx = align === 'middle' ? x + w / 2 : x + 12;
  const anchor = align === 'middle' ? 'middle' : 'start';
  return (
    <g>
      <rect className={tone} x={x} y={y} width={w} height={h} />
      {title ? (
        <text className="tb" x={tx} y={top + (lg ? 15 : 12)} textAnchor={anchor}>
          {title}
        </text>
      ) : null}
      {subs.map((s, i) => (
        <text key={i} className="t2" x={tx} y={top + (title ? titleLine : 0) + (lg ? 13 : 10.5) + i * subLine} textAnchor={anchor}>
          {s}
        </text>
      ))}
    </g>
  );
}

interface ArrowProps {
  d: string;
  red?: boolean;
  dashed?: boolean;
  both?: boolean;
  plain?: boolean;
}

export function Arrow({ d, red = false, dashed = false, both = false, plain = false }: ArrowProps) {
  const cls = red ? (dashed ? 'rd' : 'r') : dashed ? 'dash' : 'ln';
  const marker = plain ? undefined : red ? 'url(#dg-ahr)' : 'url(#dg-ah)';
  return <path className={cls} d={d} markerEnd={marker} markerStart={both ? marker : undefined} />;
}

interface NoteProps {
  x: number;
  y: number;
  lines: string[];
  anchor?: 'start' | 'middle' | 'end';
  className?: string;
  step?: number;
}

/** Red annotation text, one line per entry. */
export function Note({ x, y, lines, anchor = 'start', className = 'rt', step = 14 }: NoteProps) {
  return (
    <g>
      {lines.map((l, i) => (
        <text key={i} className={className} x={x} y={y + i * step} textAnchor={anchor}>
          {l}
        </text>
      ))}
    </g>
  );
}

interface SvgProps {
  w: number;
  h: number;
  label: string;
  children: ReactNode;
  className?: string;
}

export function Svg({ w, h, label, children, className = '' }: SvgProps) {
  return (
    <svg className={`dg ${className}`.trim()} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}
