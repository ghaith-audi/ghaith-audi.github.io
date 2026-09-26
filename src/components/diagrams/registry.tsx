import type { ComponentType } from 'react';
import { AgsPlatform, DarluxRails, DentecsModel, HmcDormant, KsaEdge, LongageSystem, NakabaTiers, OvacsSystem, TrackiSystem, type DiagramProps } from './architecture';
import { FdiChart, Gt06, Geofence, LongageStates, NakabaCalc, OvacsStorage } from './schematics';

interface Entry {
  label: string;
  Component: ComponentType<DiagramProps>;
}

/** Architecture diagrams shown in case studies. Keys are stored in project content. */
export const DIAGRAMS: Record<string, Entry> = {
  'ovacs-system': { label: 'OVACS · request path', Component: OvacsSystem },
  'longage-system': { label: '4longAge · system', Component: LongageSystem },
  'tracki-system': { label: 'Geofence & TRACKi · system', Component: TrackiSystem },
  'nakaba-tiers': { label: 'Nakaba · three tiers over Oracle', Component: NakabaTiers },
  'ags-platform': { label: 'AGS · one platform, four sites', Component: AgsPlatform },
  'ksa-edge': { label: 'AGS KSA · Arabic-on-entry routing', Component: KsaEdge },
  'darlux-rails': { label: 'Darlux · locale and payments', Component: DarluxRails },
  'hmc-dormant': { label: 'HMC · visible page, dormant platform', Component: HmcDormant },
  'dentecs-model': { label: 'Dentecs · data model', Component: DentecsModel },
};

/** Screen schematics drawn inside device frames when there is no screenshot. */
export const SCHEMATICS: Record<string, Entry & { device: 'screen' | 'phone' }> = {
  'ovacs-storage': { label: 'OVACS · storage resolution', Component: OvacsStorage, device: 'screen' },
  'longage-states': { label: '4longAge · booking states', Component: LongageStates, device: 'screen' },
  gt06: { label: 'GT06 packet layout', Component: Gt06, device: 'screen' },
  'nakaba-calc': { label: 'Nakaba · Arabic calculation output', Component: NakabaCalc, device: 'screen' },
  fdi: { label: 'FDI dental chart', Component: FdiChart, device: 'screen' },
  geofence: { label: 'Geofence (phone)', Component: Geofence, device: 'phone' },
};

export function Diagram({ id, slug }: { id?: string; slug?: string }) {
  const entry = id ? DIAGRAMS[id] : undefined;
  if (!entry) return null;
  const C = entry.Component;
  return <C slug={slug} />;
}

export function Schematic({ id }: { id?: string }) {
  const entry = id ? SCHEMATICS[id] : undefined;
  if (!entry) return null;
  const C = entry.Component;
  return <C />;
}
