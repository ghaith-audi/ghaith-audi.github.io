import { DIAGRAMS, SCHEMATICS } from '@/components/diagrams/registry';

// Field definitions drive every form in the dashboard.

export type Field =
  | { type: 'text'; key: string; label: string; help?: string; placeholder?: string; readOnly?: boolean }
  | { type: 'textarea'; key: string; label: string; help?: string; rows?: number; dir?: 'rtl' | 'auto' }
  | { type: 'lines'; key: string; label: string; help?: string; rows?: number }
  | { type: 'select'; key: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { type: 'toggle'; key: string; label: string; help?: string }
  | { type: 'image'; key: string; label: string; help?: string; name: string; maxWidth: number; maxHeight?: number }
  | { type: 'pdf'; key: string; label: string; help?: string; name: string }
  | { type: 'group'; key: string; label: string; help?: string; fields: Field[] }
  | { type: 'list'; key: string; label: string; help?: string; fields: Field[]; itemLabel: string; titleKey: string; empty: Record<string, unknown> };

export interface Tab {
  id: string;
  label: string;
  fields: Field[];
}

const text = (key: string, label: string, help?: string, placeholder?: string): Field => ({ type: 'text', key, label, help, placeholder });
const area = (key: string, label: string, help?: string, rows = 4): Field => ({ type: 'textarea', key, label, help, rows });
const lines = (key: string, label: string, help = 'One per line.', rows = 4): Field => ({ type: 'lines', key, label, help, rows });

const diagramOptions = [{ value: '', label: 'None' }, ...Object.entries(DIAGRAMS).map(([value, d]) => ({ value, label: d.label }))];
const screenOptions = [
  { value: '', label: 'None' },
  ...Object.entries(SCHEMATICS)
    .filter(([, s]) => s.device === 'screen')
    .map(([value, s]) => ({ value, label: s.label })),
];
const phoneOptions = [
  { value: '', label: 'None' },
  ...Object.entries(SCHEMATICS)
    .filter(([, s]) => s.device === 'phone')
    .map(([value, s]) => ({ value, label: s.label })),
];

export const PROJECT_TABS: Tab[] = [
  {
    id: 'card',
    label: 'Card',
    fields: [
      text('name', 'Project name'),
      { type: 'text', key: 'slug', label: 'URL slug', help: 'Part of the case-study address: /projects/slug. Fixed after the project is created.', readOnly: true },
      text('category', 'Category', 'Short type, e.g. “Document management SaaS”.'),
      area('summary', 'Card description', 'One or two sentences shown on the homepage card.', 3),
      {
        type: 'select',
        key: 'status',
        label: 'Status',
        options: [
          { value: 'live', label: 'Live' },
          { value: 'pilot', label: 'Live pilot' },
          { value: 'private', label: 'Private deployment' },
        ],
      },
      text('url', 'Live URL', 'Leave empty for private deployments.', 'https://'),
      lines('tags', 'Card technologies', 'Four or five, one per line.', 5),
      { type: 'toggle', key: 'featured', label: 'Featured (full-width card)' },
      {
        type: 'group',
        key: 'visual',
        label: 'Device mockup',
        help: 'Real screenshots win. Without a desktop screenshot the laptop shows the schematic.',
        fields: [
          { type: 'image', key: 'desktop', label: 'Desktop screenshot', help: '16:10, ideally 1440 × 900.', name: 'desktop', maxWidth: 1440 },
          { type: 'image', key: 'mobile', label: 'Phone screenshot', help: 'About 9:19.5, e.g. 390 × 844 at 2×.', name: 'mobile', maxWidth: 520 },
          { type: 'image', key: 'full', label: 'Full-length page (case study)', help: 'A tall screenshot of the whole homepage.', name: 'full', maxWidth: 1200, maxHeight: 4200 },
          { type: 'select', key: 'schematic', label: 'Laptop schematic (when no screenshot)', options: screenOptions },
          { type: 'select', key: 'mobileSchematic', label: 'Phone schematic (when no phone screenshot)', options: phoneOptions },
        ],
      },
    ],
  },
  {
    id: 'facts',
    label: 'Facts',
    fields: [
      area('oneLiner', 'One-line description', 'Shown under the title on the case-study page.', 2),
      text('role', 'Role (short)', 'e.g. “Backend, web frontend and architecture”.'),
      text('period', 'Period', 'e.g. “2025 — Present”.'),
      text('client', 'Client', 'Optional.'),
      lines('related', 'Related projects', 'Slugs of projects on the same platform, one per line.', 3),
    ],
  },
  {
    id: 'story',
    label: 'Overview & role',
    fields: [
      {
        type: 'group',
        key: 'overview',
        label: 'Overview',
        fields: [area('what', 'What it is', undefined, 4), area('who', "Who it's for", undefined, 3), area('problem', 'The problem', undefined, 4)],
      },
      {
        type: 'group',
        key: 'roleDetail',
        label: 'My role',
        fields: [area('summary', 'Summary', undefined, 3), lines('items', 'What I did', 'One responsibility per line.', 6)],
      },
    ],
  },
  {
    id: 'tech',
    label: 'Architecture & build',
    fields: [
      {
        type: 'group',
        key: 'architecture',
        label: 'Architecture',
        fields: [
          { type: 'select', key: 'diagram', label: 'Built-in diagram', options: diagramOptions },
          { type: 'image', key: 'image', label: 'Or upload a diagram image', help: 'Used only when no built-in diagram is selected.', name: 'architecture', maxWidth: 1600 },
          text('caption', 'Caption'),
          {
            type: 'list',
            key: 'components',
            label: 'Main components',
            itemLabel: 'Component',
            titleKey: 'title',
            empty: { title: '', body: '' },
            fields: [text('title', 'Name'), area('body', 'Description', undefined, 3)],
          },
        ],
      },
      {
        type: 'list',
        key: 'implementation',
        label: 'Technical implementation',
        help: 'Backend, APIs, database, auth, real-time, storage, infrastructure, integrations: whichever apply.',
        itemLabel: 'Area',
        titleKey: 'title',
        empty: { title: '', body: '' },
        fields: [text('title', 'Area'), area('body', 'Details', undefined, 4)],
      },
    ],
  },
  {
    id: 'decisions',
    label: 'Decisions & challenges',
    fields: [
      {
        type: 'list',
        key: 'decisions',
        label: 'Engineering decisions',
        itemLabel: 'Decision',
        titleKey: 'title',
        empty: { title: '', context: '', decision: '', tradeoff: '', code: '', codeLang: '' },
        fields: [
          text('title', 'Title'),
          area('context', 'Context', undefined, 2),
          area('decision', 'Decision', undefined, 3),
          area('tradeoff', 'Trade-off', undefined, 2),
          { type: 'textarea', key: 'code', label: 'Code snippet (optional)', rows: 5, dir: 'auto' },
          {
            type: 'select',
            key: 'codeLang',
            label: 'Snippet language',
            options: [
              { value: '', label: 'Plain' },
              { value: 'python', label: 'Python' },
              { value: 'ts', label: 'TypeScript' },
              { value: 'js', label: 'JavaScript' },
              { value: 'json', label: 'JSON' },
              { value: 'text', label: 'Text / log' },
              { value: 'arabic', label: 'Arabic text (right to left)' },
            ],
          },
        ],
      },
      {
        type: 'list',
        key: 'challenges',
        label: 'Challenges & solutions',
        itemLabel: 'Challenge',
        titleKey: 'problem',
        empty: { problem: '', solution: '' },
        fields: [area('problem', 'Problem', undefined, 2), area('solution', 'Solution', undefined, 3)],
      },
    ],
  },
  {
    id: 'results',
    label: 'Results & stack',
    fields: [
      {
        type: 'group',
        key: 'results',
        label: 'Results & current state',
        help: 'Only documented numbers. No invented users, revenue or performance figures.',
        fields: [
          area('status', 'Current state', undefined, 3),
          {
            type: 'list',
            key: 'metrics',
            label: 'Metrics',
            itemLabel: 'Metric',
            titleKey: 'label',
            empty: { value: '', label: '' },
            fields: [text('value', 'Value', undefined, 'e.g. 186'), text('label', 'Label', undefined, 'e.g. API paths')],
          },
          lines('notes', 'Notes', 'Honest caveats, one per line.', 3),
        ],
      },
      {
        type: 'list',
        key: 'stack',
        label: 'Technology stack',
        itemLabel: 'Group',
        titleKey: 'group',
        empty: { group: '', items: [] },
        fields: [text('group', 'Group', undefined, 'e.g. Backend'), lines('items', 'Technologies', 'One per line.', 4)],
      },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [
      { type: 'group', key: 'seo', label: 'Search and sharing', fields: [text('title', 'Page title'), area('description', 'Meta description', 'About 150 characters.', 3)] },
    ],
  },
];

export const SITE_TABS: Tab[] = [
  {
    id: 'profile',
    label: 'Profile & hero',
    fields: [
      text('name', 'Full name'),
      text('firstName', 'First line of the big name'),
      text('lastName', 'Second line of the big name'),
      lines('roles', 'Role lines', 'Shown under your name; the last line is highlighted.', 3),
      area('tagline', 'Short introduction', undefined, 2),
      text('location', 'Location'),
      text('timezone', 'Time zone'),
      text('languages', 'Languages'),
      { type: 'toggle', key: 'available', label: 'Show availability' },
      text('availability', 'Availability text'),
      { type: 'image', key: 'portrait', label: 'Portrait', help: 'Square works best.', name: 'portrait', maxWidth: 900 },
      text('portraitAlt', 'Portrait description (alt text)'),
      {
        type: 'list',
        key: 'heroFacts',
        label: 'Facts under the hero',
        itemLabel: 'Fact',
        titleKey: 'label',
        empty: { value: '', label: '' },
        fields: [text('value', 'Value'), text('label', 'Label')],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact & CV',
    fields: [
      text('email', 'Email'),
      text('linkedin', 'LinkedIn URL'),
      text('github', 'GitHub URL'),
      { type: 'pdf', key: 'cv', label: 'CV (PDF)', help: 'The Download CV buttons appear once a CV is published.', name: 'cv' },
      {
        type: 'group',
        key: 'contact',
        label: 'Contact section',
        fields: [text('eyebrow', 'Label'), text('title', 'Headline'), text('body', 'Line under the headline'), text('button', 'Button text'), area('note', 'Note', undefined, 2)],
      },
      { type: 'group', key: 'footer', label: 'Footer', fields: [text('note', 'Footer note')] },
    ],
  },
  {
    id: 'sections',
    label: 'Homepage sections',
    fields: [
      { type: 'group', key: 'work', label: 'Selected work', fields: [text('title', 'Title'), area('lead', 'Intro', undefined, 2)] },
      {
        type: 'group',
        key: 'approach',
        label: 'How I build software',
        fields: [
          text('title', 'Title'),
          area('lead', 'Intro', undefined, 2),
          {
            type: 'list',
            key: 'steps',
            label: 'Steps',
            itemLabel: 'Step',
            titleKey: 'title',
            empty: { title: '', body: '', example: '' },
            fields: [text('title', 'Title'), text('body', 'Sentence'), text('example', 'Real example (small text)')],
          },
        ],
      },
      {
        type: 'group',
        key: 'experience',
        label: 'Experience',
        fields: [
          text('title', 'Title'),
          area('lead', 'Intro', undefined, 2),
          {
            type: 'list',
            key: 'items',
            label: 'Timeline',
            itemLabel: 'Entry',
            titleKey: 'org',
            empty: { period: '', org: '', role: '', location: '', bullets: [] },
            fields: [text('period', 'Dates'), text('org', 'Company or context'), text('role', 'Role'), text('location', 'Location'), lines('bullets', 'Bullets', 'Two or three, one per line.', 4)],
          },
        ],
      },
      {
        type: 'group',
        key: 'stack',
        label: 'Technical stack',
        fields: [
          text('title', 'Title'),
          area('lead', 'Intro', undefined, 2),
          {
            type: 'list',
            key: 'groups',
            label: 'Groups',
            itemLabel: 'Group',
            titleKey: 'group',
            empty: { group: '', items: [] },
            fields: [text('group', 'Group'), lines('items', 'Technologies', 'One per line.', 4)],
          },
        ],
      },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [
      {
        type: 'group',
        key: 'seo',
        label: 'Search and sharing',
        fields: [text('title', 'Site title'), area('description', 'Meta description', 'About 150 characters.', 3), lines('keywords', 'Keywords', 'One per line.', 4)],
      },
    ],
  },
];

export function emptyProject(slug: string, name: string, order: number) {
  return {
    slug,
    order,
    featured: false,
    name,
    category: '',
    summary: '',
    oneLiner: '',
    status: 'private',
    url: '',
    period: '',
    client: '',
    role: '',
    tags: [],
    visual: { desktop: '', mobile: '', full: '', schematic: '', mobileSchematic: '' },
    overview: { what: '', who: '', problem: '' },
    roleDetail: { summary: '', items: [] },
    architecture: { diagram: '', image: '', caption: '', components: [] },
    implementation: [],
    decisions: [],
    challenges: [],
    results: { status: '', metrics: [], notes: [] },
    stack: [],
    related: [],
    seo: { title: '', description: '' },
  };
}
