export type Status = 'live' | 'pilot' | 'private';

export interface Metric {
  value: string;
  label: string;
}

export interface TitledText {
  title: string;
  body: string;
}

export interface Decision {
  title: string;
  context?: string;
  decision: string;
  tradeoff?: string;
  code?: string;
  codeLang?: string;
}

export interface Challenge {
  problem: string;
  solution: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface ProjectVisual {
  /** Desktop screenshot, 16:10, e.g. /projects/slug/desktop.webp */
  desktop?: string;
  /** Phone screenshot, roughly 9:19.5 */
  mobile?: string;
  /** Tall full-page screenshot shown in the case study */
  full?: string;
  /** Built-in schematic drawn on the laptop screen when there is no screenshot */
  schematic?: string;
  /** Built-in schematic drawn on the phone screen when there is no phone screenshot */
  mobileSchematic?: string;
}

export interface Project {
  slug: string;
  order: number;
  featured?: boolean;
  name: string;
  category: string;
  summary: string;
  oneLiner: string;
  status: Status;
  url?: string;
  period: string;
  client?: string;
  role: string;
  tags: string[];
  visual: ProjectVisual;
  overview: { what: string; who: string; problem: string };
  roleDetail: { summary: string; items: string[] };
  architecture: { diagram?: string; image?: string; caption?: string; components: TitledText[] };
  implementation: TitledText[];
  decisions: Decision[];
  challenges: Challenge[];
  results: { status: string; metrics: Metric[]; notes: string[] };
  stack: StackGroup[];
  related?: string[];
  seo?: { title?: string; description?: string };
}

export interface ExperienceItem {
  period: string;
  org: string;
  role: string;
  location?: string;
  bullets: string[];
}

export interface ApproachStep {
  title: string;
  body: string;
  example?: string;
}

export interface Site {
  name: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tagline: string;
  location: string;
  timezone: string;
  availability: string;
  available: boolean;
  languages: string;
  email: string;
  linkedin: string;
  github: string;
  cv: string;
  portrait: string;
  portraitAlt: string;
  heroFacts: Metric[];
  work: { title: string; lead: string };
  approach: { title: string; lead?: string; steps: ApproachStep[] };
  experience: { title: string; lead?: string; items: ExperienceItem[] };
  stack: { title: string; lead?: string; groups: StackGroup[] };
  contact: { eyebrow: string; title: string; body: string; button: string; note?: string };
  footer: { note: string };
  seo: { title: string; description: string; keywords?: string[] };
}
