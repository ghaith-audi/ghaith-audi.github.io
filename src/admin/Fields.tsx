'use client';

import { useId, useRef, useState } from 'react';
import type { Field } from './schema';
import s from './admin.module.css';

export type Obj = Record<string, unknown>;

export interface UploadSpec {
  name: string;
  kind: 'image' | 'pdf';
  maxWidth?: number;
  maxHeight?: number;
}

export interface FieldCtx {
  /** Turns a stored public path into a URL the browser can show (including unpublished uploads). */
  resolve: (path: string) => string;
  /** Processes a file, queues it for the next commit and returns its public path. */
  upload: (spec: UploadSpec, file: File) => Promise<string>;
}

const asStr = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asObj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});

function Help({ text }: { text?: string }) {
  return text ? <p className={s.help}>{text}</p> : null;
}

export function Fields({ fields, value, onChange, ctx }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; ctx: FieldCtx }) {
  return (
    <div className={s.fields}>
      {fields.map((f) => (
        <FieldView key={f.key} field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} ctx={ctx} />
      ))}
    </div>
  );
}

function FieldView({ field, value, onChange, ctx }: { field: Field; value: unknown; onChange: (v: unknown) => void; ctx: FieldCtx }) {
  const id = useId();
  switch (field.type) {
    case 'text':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{field.label}</label>
          <input
            id={id}
            type="text"
            value={asStr(value)}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          <Help text={field.help} />
        </div>
      );
    case 'textarea':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{field.label}</label>
          <textarea id={id} rows={field.rows ?? 4} dir={field.dir} value={asStr(value)} onChange={(e) => onChange(e.target.value)} />
          <Help text={field.help} />
        </div>
      );
    case 'lines':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{field.label}</label>
          <textarea
            id={id}
            rows={field.rows ?? 4}
            value={asArr(value).map(asStr).join('\n')}
            onChange={(e) => onChange(e.target.value.split('\n'))}
          />
          <Help text={field.help} />
        </div>
      );
    case 'select':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{field.label}</label>
          <select id={id} value={asStr(value)} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Help text={field.help} />
        </div>
      );
    case 'toggle':
      return (
        <div className={s.field}>
          <label className={s.toggle} htmlFor={id}>
            <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span>{field.label}</span>
          </label>
          <Help text={field.help} />
        </div>
      );
    case 'image':
      return <UploadField field={field} kind="image" value={asStr(value)} onChange={onChange} ctx={ctx} />;
    case 'pdf':
      return <UploadField field={field} kind="pdf" value={asStr(value)} onChange={onChange} ctx={ctx} />;
    case 'group':
      return (
        <fieldset className={s.group}>
          <legend>{field.label}</legend>
          <Help text={field.help} />
          <Fields fields={field.fields} value={asObj(value)} onChange={onChange} ctx={ctx} />
        </fieldset>
      );
    case 'list':
      return <ListField field={field} value={asArr(value).map(asObj)} onChange={onChange} ctx={ctx} />;
    default:
      return null;
  }
}

function UploadField({
  field,
  kind,
  value,
  onChange,
  ctx,
}: {
  field: Extract<Field, { type: 'image' } | { type: 'pdf' }>;
  kind: 'image' | 'pdf';
  value: string;
  onChange: (v: unknown) => void;
  ctx: FieldCtx;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const id = useId();

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const spec: UploadSpec =
        field.type === 'image'
          ? { name: field.name, kind, maxWidth: field.maxWidth, maxHeight: field.maxHeight }
          : { name: field.name, kind };
      onChange(await ctx.upload(spec, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className={s.field}>
      <label htmlFor={id}>{field.label}</label>
      <div className={s.upload}>
        {value ? (
          kind === 'image' ? (
            <img src={ctx.resolve(value)} alt="" className={s.thumb} />
          ) : (
            <a className={s.fileLink} href={ctx.resolve(value)} target="_blank" rel="noreferrer">
              {value.split('/').pop()}
            </a>
          )
        ) : (
          <span className={s.emptyThumb}>{kind === 'image' ? 'No image' : 'No file'}</span>
        )}
        <div className={s.uploadActions}>
          <input
            id={id}
            ref={input}
            type="file"
            accept={kind === 'image' ? 'image/png,image/jpeg,image/webp' : 'application/pdf'}
            className={s.fileInput}
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <button type="button" className={s.btn} onClick={() => input.current?.click()} disabled={busy}>
            {busy ? 'Processing…' : value ? 'Replace' : 'Upload'}
          </button>
          {value ? (
            <button type="button" className={s.btnGhost} onClick={() => onChange('')} disabled={busy}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className={s.error}>{error}</p> : null}
      <Help text={field.help} />
    </div>
  );
}

function ListField({
  field,
  value,
  onChange,
  ctx,
}: {
  field: Extract<Field, { type: 'list' }>;
  value: Obj[];
  onChange: (v: unknown) => void;
  ctx: FieldCtx;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((prev) => {
      const n = new Set<number>();
      prev.forEach((k) => n.add(k === i ? j : k === j ? i : k));
      return n;
    });
  };

  const remove = (i: number) => {
    onChange(value.filter((_, k) => k !== i));
    setOpen((prev) => {
      const n = new Set<number>();
      prev.forEach((k) => {
        if (k < i) n.add(k);
        else if (k > i) n.add(k - 1);
      });
      return n;
    });
  };

  const add = () => {
    onChange([...value, JSON.parse(JSON.stringify(field.empty)) as Obj]);
    setOpen((prev) => new Set(prev).add(value.length));
  };

  return (
    <fieldset className={s.group}>
      <legend>
        {field.label} <span className={s.count}>{value.length}</span>
      </legend>
      <Help text={field.help} />
      <ol className={s.list}>
        {value.map((item, i) => {
          const title = asStr(item[field.titleKey]).trim() || `Untitled ${field.itemLabel.toLowerCase()}`;
          const isOpen = open.has(i);
          return (
            <li key={i} className={s.item}>
              <div className={s.itemHead}>
                <button type="button" className={s.itemTitle} onClick={() => toggle(i)} aria-expanded={isOpen}>
                  <span className={s.itemNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.itemText}>{title}</span>
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                <div className={s.itemTools}>
                  <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${title} up`}>
                    ↑
                  </button>
                  <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${title} down`}>
                    ↓
                  </button>
                  <button type="button" className={s.iconBtn} onClick={() => remove(i)} aria-label={`Remove ${title}`}>
                    ✕
                  </button>
                </div>
              </div>
              {isOpen ? (
                <div className={s.itemBody}>
                  <Fields fields={field.fields} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} ctx={ctx} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <button type="button" className={s.btnGhost} onClick={add}>
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}
