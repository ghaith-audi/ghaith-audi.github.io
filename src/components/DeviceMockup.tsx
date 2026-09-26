import { asset } from '@/lib/paths';
import { Schematic } from './diagrams/registry';
import s from './DeviceMockup.module.css';

interface Props {
  name: string;
  desktop?: string;
  mobile?: string;
  schematic?: string;
  mobileSchematic?: string;
  /** Load images eagerly (above the fold). */
  priority?: boolean;
  /** Resolves stored paths to URLs. The dashboard preview passes its own resolver for unpublished uploads. */
  resolve?: (path: string) => string;
}

/** A laptop, optionally with a phone in front of it, showing real screenshots or a schematic. */
export default function DeviceMockup({ name, desktop, mobile, schematic, mobileSchematic, priority = false, resolve = asset }: Props) {
  const hasPhone = Boolean(mobile || mobileSchematic);
  const loading = priority ? 'eager' : 'lazy';
  return (
    <div className={`${s.stage} ${hasPhone ? '' : s.solo}`}>
      <div className={s.laptop}>
        <div className={s.lid}>
          <span className={s.camera} aria-hidden="true" />
          <div className={s.screen}>
            {desktop ? (
              <img
                src={resolve(desktop)}
                alt={`Screenshot of the ${name} website on a laptop`}
                width={1440}
                height={900}
                loading={loading}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
              />
            ) : schematic ? (
              <div className={s.schematic}>
                <Schematic id={schematic} />
              </div>
            ) : (
              <div className={s.blank}>
                <span>{name}</span>
              </div>
            )}
          </div>
        </div>
        <div className={s.base} aria-hidden="true" />
      </div>
      {hasPhone ? (
        <div className={s.phone}>
          <span className={s.notch} aria-hidden="true" />
          <div className={s.phoneScreen}>
            {mobile ? (
              <img src={resolve(mobile)} alt={`Screenshot of the ${name} website on a phone`} width={520} height={1125} loading={loading} decoding="async" />
            ) : (
              <div className={s.schematic}>
                <Schematic id={mobileSchematic} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
