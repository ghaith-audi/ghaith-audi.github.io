import { Arrow, Box, Note, Svg } from './primitives';

export interface DiagramProps {
  /** Slug of the project the diagram is shown on, used to highlight shared diagrams. */
  slug?: string;
}

export function OvacsSystem() {
  return (
    <Svg w={640} h={386} label="OVACS architecture: web, Android and superadmin clients call Nginx, then Django REST Framework, where each request passes JWT auth, a workspace check, the case role, file clearance, the subscription gate and the storage factory, before reaching MySQL, Google Drive, Cloudflare R2, Stripe and Firebase.">
      <Box x={8} y={8} w={196} h={46} title="React web app" />
      <Box x={222} y={8} w={196} h={46} title="Android app" sub="Flutter" />
      <Box x={436} y={8} w={196} h={46} title="Superadmin panel" />
      <Arrow d="M106 54 V82" />
      <Arrow d="M320 54 V82" />
      <Arrow d="M534 54 V82" />
      <text className="t3" x={213} y={72} textAnchor="middle">HTTPS · JWT</text>
      <text className="t3" x={427} y={72} textAnchor="middle">?owner_account_id=</text>

      <Box x={8} y={84} w={624} h={46} title="Nginx" sub="TLS · security headers · unbuffered location for file streaming" />
      <Arrow d="M320 130 V156" />

      <rect className="bx2" x={8} y={158} width={624} height={146} />
      <text className="tb" x={22} y={180}>Django REST Framework</text>
      <text className="t2" x={618} y={180} textAnchor="end">~197 routes · one response envelope</text>
      <Box x={28} y={194} w={180} h={36} title="JWT auth" />
      <Box x={230} y={194} w={180} h={36} title="workspace check" />
      <Box x={432} y={194} w={180} h={36} title="case role" />
      <Box x={28} y={244} w={180} h={36} title="clearance" tone="bxr" />
      <Box x={230} y={244} w={180} h={36} title="subscription gate" />
      <Box x={432} y={244} w={180} h={36} title="storage factory" />
      <Arrow d="M208 212 H228" />
      <Arrow d="M410 212 H430" />
      <Arrow d="M522 230 V237 H118 V242" />
      <Arrow d="M208 262 H228" />
      <Arrow d="M410 262 H430" />
      <text className="rt" x={28} y={297}>clearance is re-checked every 10 chunks while a file streams</text>

      <Arrow d="M320 304 V322" plain />
      <path className="ln" d="M60 322 H580" />
      <Arrow d="M60 322 V332" />
      <Arrow d="M199 322 V332" />
      <Arrow d="M349 322 V332" />
      <Arrow d="M470 322 V332" />
      <Arrow d="M580 322 V332" />
      <Box x={8} y={334} w={104} h={46} title="MySQL" sub="45 models" />
      <Box x={124} y={334} w={150} h={46} title="Google Drive" sub="customer's own" />
      <Box x={286} y={334} w={126} h={46} title="Cloudflare R2" sub="fallback" />
      <Box x={424} y={334} w={92} h={46} title="Stripe" sub="billing" />
      <Box x={528} y={334} w={104} h={46} title="Firebase" sub="push" />
    </Svg>
  );
}

export function LongageSystem() {
  return (
    <Svg w={640} h={350} label="4longAge architecture: a Next.js progressive web app talks to a Django and Django Ninja API over REST and Server-Sent Events; the API uses PostgreSQL, Redis and encrypted media storage, and Celery runs six scheduled jobs.">
      <Box x={150} y={8} w={340} h={50} title="Next.js 15 PWA" sub="Arabic RTL · English · offline write queue" />
      <Arrow d="M250 58 V96" />
      <Arrow d="M390 96 V60" />
      <text className="t3" x={242} y={82} textAnchor="end">REST /api/v1</text>
      <text className="t3" x={398} y={82}>SSE · 4 channels</text>
      <Box x={150} y={98} w={340} h={50} title="Django 5.2 + Django Ninja" sub="186 paths · RBAC · idempotency · audit" tone="bx2" />
      <Arrow d="M320 148 V168" plain />
      <path className="ln" d="M110 168 H530" />
      <Arrow d="M110 168 V194" />
      <Arrow d="M320 168 V194" />
      <Arrow d="M530 168 V194" />
      <Box x={10} y={196} w={200} h={62} title="PostgreSQL" sub={['65 tables · constraints', 'ledger trigger']} />
      <Box x={220} y={196} w={200} h={62} title="Redis" sub={['cache · broker', 'SSE fan-out']} />
      <Box x={430} y={196} w={200} h={62} title="Media files" sub={['AES-GCM identity docs', 'signed 24 h links']} />
      <Arrow d="M320 258 V288" />
      <Box x={220} y={290} w={200} h={50} title="Celery worker + beat" sub="6 scheduled jobs" />
      <Note x={10} y={280} lines={['no double booking:', 'EXCLUDE (provider =, slot &&)']} />
      <Note x={436} y={306} lines={['offers every 60 s', 'reminders every 5 min', 'weekly payout run']} className="t2" />
    </Svg>
  );
}

export function TrackiSystem() {
  return (
    <Svg w={640} h={352} label="Geofence and TRACKi architecture: React dashboards and the Flutter app talk to Django with Channels; GPS trackers connect over raw TCP to a FastAPI asyncio service that forwards decoded positions to Django; Django uses MySQL, Redis and Celery; Traccar and OSRM provide the live GPS server and road snapping.">
      <Box x={8} y={20} w={160} h={54} title="React dashboards" sub={['manager · employee', 'TRACKi customer']} />
      <Box x={8} y={100} w={160} h={54} title="Flutter app" sub={['employee GPS', 'with a teammate']} />
      <Box x={8} y={262} w={160} h={54} title="GPS trackers" sub={['GT06 · HQ', 'raw TCP']} />

      <rect className="bx2" x={214} y={20} width={212} height={196} />
      <text className="tb" x={230} y={42}>Django + Channels</text>
      <text className="t2" x={230} y={62}>7 apps · 26 models</text>
      <text className="t2" x={230} y={78}>~125 REST endpoints</text>
      <path className="dash" d="M230 92 H410" />
      <text className="t2" x={230} y={112}>ws · location in</text>
      <text className="t2" x={230} y={130}>ws · dashboard out</text>
      <text className="t2" x={230} y={148}>ws · TRACKi live</text>
      <text className="t2" x={230} y={166}>ws · raw device monitor</text>
      <text className="t3" x={230} y={200}>REST FOR CRUD · WS FOR LOCATION</text>

      <Box x={214} y={262} w={212} h={54} title="GPS tracker service" sub={['FastAPI + asyncio', 'GT06 · HQ · CRC-ITU']} />

      <Box x={472} y={20} w={160} h={40} title="MySQL" />
      <Box x={472} y={76} w={160} h={54} title="Redis" sub={['broker · channels', 'filter state']} />
      <Box x={472} y={146} w={160} h={54} title="Celery beat" sub={['30 s geofence sweep', 'hourly subscriptions']} />
      <Box x={472} y={262} w={160} h={54} title="Traccar · OSRM" sub={['live GPS server', 'road snapping']} />

      <Arrow d="M168 47 H212" both />
      <Arrow d="M168 127 H212" />
      <Arrow d="M168 289 H212" />
      <text className="t3" x={190} y={281} textAnchor="middle">TCP</text>
      <Arrow d="M320 262 V218" />
      <text className="t3" x={328} y={244}>DECODED POSITIONS</text>
      <Arrow d="M426 40 H470" />
      <Arrow d="M426 103 H470" />
      <Arrow d="M426 173 H470" />
      <Arrow d="M426 289 H470" red dashed both />
      <Note x={214} y={340} lines={['one GPS-backend adapter: Traccar is live, the custom TCP server stays switchable']} />
    </Svg>
  );
}

export function NakabaTiers() {
  return (
    <Svg w={640} h={292} label="Nakaba Central architecture: a React Arabic dashboard over Django REST Framework over the syndicate's existing Oracle schema, which legacy desktop tools still write to.">
      <Box x={8} y={12} w={440} h={58} title="React · Arabic RTL dashboard" sub="13 protected routes · dark mode" />
      <Arrow d="M228 72 V104" both />
      <Box x={8} y={106} w={440} h={58} title="Django REST Framework" sub="686 models · 5 pension engines · 0 raw SQL" tone="bx2" />
      <Arrow d="M228 166 V198" both />
      <rect className="bxh" x={8} y={200} width={440} height={84} />
      <Box x={88} y={214} w={280} h={56} title="Oracle · existing schema" sub="682 tables · 673 managed = False" />
      <Box x={492} y={206} w={140} h={72} title="Desktop tools" sub={['legacy, still', 'in daily use']} />
      <Arrow d="M492 242 H450" />
      <Note x={470} y={34} lines={['no migration', 'no cut-over', 'no downtime']} />
      <Note x={492} y={196} lines={['still writing here']} />
    </Svg>
  );
}

const AGS_SITES = [
  { slug: 'ags-international', domain: 'ags.ac', note: 'UAE · English' },
  { slug: 'ags-international-ksa', domain: 'agsintl.sa', note: 'KSA · Arabic first' },
  { slug: 'darlux', domain: 'darlux.net', note: 'Syria · Arabic' },
  { slug: 'hmc-international', domain: 'hmcfz.co', note: 'Dubai · English' },
];

export function AgsPlatform({ slug }: DiagramProps) {
  const xs = [16, 172, 328, 484];
  return (
    <Svg w={640} h={286} label="The AGS platform: one brand-agnostic core configured by environment variables, design tokens and database content, deployed four times as ags.ac, agsintl.sa, darlux.net and hmcfz.co on one server.">
      <Note x={8} y={30} lines={['Darlux, HMC:', 'clean git init']} />
      <Note x={8} y={64} lines={['KSA: history kept']} />
      <Box x={180} y={16} w={280} h={70} title="platform core" sub={['env · @theme tokens', 'MongoDB content']} tone="bx2" />
      <Note x={476} y={30} lines={['SEO built on KSA,', 'then replayed', 'upstream to ags.ac']} />
      <Arrow d="M320 86 V124" plain />
      <path className="ln" d="M84 124 H552" />
      {AGS_SITES.map((s, i) => {
        const cx = xs[i] + 68;
        const hot = s.slug === slug;
        return (
          <g key={s.slug}>
            <Arrow d={`M${cx} 124 V166`} />
            <rect className={hot ? 'bxr' : 'bx'} x={xs[i]} y={168} width={136} height={46} />
            <text className={hot ? 'tb' : 't'} x={cx} y={195} textAnchor="middle">
              {s.domain}
            </text>
            <text className="t2" x={cx} y={234} textAnchor="middle">
              {s.note}
            </text>
          </g>
        );
      })}
      <path className="rd" d="M262 168 C 280 146, 300 120, 330 90" markerEnd="url(#dg-ahr)" />
      <text className="t2" x={320} y={272} textAnchor="middle">one VPS · four PM2 apps · four databases · Nginx</text>
    </Svg>
  );
}

export function KsaEdge() {
  return (
    <Svg w={640} h={296} label="Arabic-on-entry routing: a request for the homepage without a same-host referrer is redirected to the Arabic homepage; a request with one is served in English; every response pins the market cookie to Saudi Arabia.">
      <Box x={8} y={70} w={120} h={46} title="GET /" />
      <Arrow d="M128 93 H176" />
      <polygon className="bx2" points="178,93 262,48 346,93 262,138" />
      <text className="tb" x={262} y={90} textAnchor="middle">same-host</text>
      <text className="tb" x={262} y={106} textAnchor="middle">Referer?</text>
      <Arrow d="M262 48 V24 H386" />
      <text className="t3" x={300} y={18}>NO · FRESH VISIT</text>
      <Box x={390} y={2} w={242} h={44} title="302 → /ar" sub="Arabic homepage" tone="bxr" />
      <Arrow d="M262 138 V162 H386" />
      <text className="t3" x={300} y={156}>YES · IN-SITE CLICK</text>
      <Box x={390} y={140} w={242} h={44} title="serve /" sub="English stays reachable" />
      <text className="t2" x={392} y={202}>e.g. the language switcher</text>
      <Box x={8} y={214} w={624} h={44} title="Every response: market cookie = SA" sub="server render and browser agree from the first paint" tone="bx2" />
      <Note x={8} y={284} lines={['Next.js 16: this lives in src/proxy.ts. A root middleware.ts is silently ignored.']} />
    </Svg>
  );
}

export function DarluxRails() {
  const methods = ['ShamCash', 'SyriatelCash', 'Cash on delivery', 'Bank transfer'];
  return (
    <Svg w={640} h={276} label="Darlux configuration: Arabic is the default locale with English at /en; checkout reads Syria's payment methods from the Country model: ShamCash, SyriatelCash, cash on delivery and bank transfer; Stripe is not configured.">
      <text className="t3" x={8} y={22}>LOCALE ROUTING</text>
      <Box x={8} y={32} w={220} h={44} title="/  →  Arabic" sub="default locale" tone="bxr" />
      <Box x={8} y={88} w={220} h={40} title="/en  →  English" />
      <text className="t3" x={268} y={22}>CHECKOUT</text>
      <Box x={268} y={32} w={160} h={44} title="Checkout" />
      <Arrow d="M428 54 H472" />
      <Box x={474} y={32} w={158} h={44} title="Country: Syria" sub="payment methods" tone="bx2" />
      <rect className="bxd" x={268} y={88} width={160} height={36} />
      <text className="t2" x={348} y={110} textAnchor="middle">Stripe · not configured</text>
      <path className="r" d="M276 106 H420" />
      <path className="ln" d="M553 76 V148 M81 148 H561" />
      {methods.map((m, i) => {
        const x = 9 + i * 160;
        return (
          <g key={m}>
            <Arrow d={`M${x + 72} 148 V174`} />
            <Box x={x} y={176} w={144} h={44} title={m} />
          </g>
        );
      })}
      <Note x={8} y={262} lines={["defaultLocale: 'ar' · localeDetection: false · builds with no STRIPE_SECRET_KEY"]} />
    </Svg>
  );
}

export function HmcDormant() {
  const sections = ['hero', 'about', 'what we do', 'products', 'global presence', 'contact'];
  const fields = ['branding · colours', 'menu · hero', 'about · what we do', 'products · presence', 'partners · contact', 'footer · SEO fields'];
  return (
    <Svg w={640} h={316} label="HMC site structure: one landing-content document renders the visible single-page site; the storefront, cart, checkout, blog, careers and admin routes stay built but dormant underneath.">
      <rect className="bx" x={8} y={12} width={300} height={178} />
      <text className="t3" x={22} y={32}>VISIBLE · ONE PAGE</text>
      {sections.map((s, i) => (
        <g key={s}>
          <rect className="bx2" x={22} y={44 + i * 22} width={272} height={16} />
          <text className="t2" x={30} y={56 + i * 22}>
            {s}
          </text>
        </g>
      ))}
      <rect className="bx2" x={380} y={12} width={252} height={178} />
      <text className="tb" x={396} y={36}>HmcLandingContent</text>
      {fields.map((f, i) => (
        <text key={f} className="t2" x={396} y={58 + i * 18}>
          {f}
        </text>
      ))}
      <text className="t3" x={396} y={176}>ONE DOCUMENT · 229-LINE SCHEMA</text>
      <Arrow d="M378 100 H312" />
      <text className="t3" x={345} y={92} textAnchor="middle">RENDERS</text>
      <rect className="bxh" x={8} y={222} width={624} height={64} />
      <rect className="bx" x={120} y={234} width={400} height={40} />
      <text className="tb" x={320} y={251} textAnchor="middle">Dormant: storefront · cart · checkout</text>
      <text className="t2" x={320} y={266} textAnchor="middle">blog · careers · admin · 83 routes</text>
      <Note x={8} y={306} lines={['switching the storefront on means swapping two files']} />
    </Svg>
  );
}

export function DentecsModel() {
  const records = ['Appointment', 'Invoice', 'Prescription', 'X-ray panorama'];
  return (
    <Svg w={640} h={332} label="Dentecs data model: a patient carries per-tooth maps keyed by FDI code and links to appointments, invoices, prescriptions and X-rays; a multi-tooth session links many teeth and many works and stores a frozen copy of the prices.">
      <rect className="bx2" x={8} y={12} width={220} height={122} />
      <text className="tb" x={22} y={34}>Patient</text>
      <text className="t2" x={22} y={56}>teeth_status  {'{FDI: bool}'}</text>
      <text className="t2" x={22} y={74}>fulcrums      {'{FDI: bool}'}</text>
      <text className="t2" x={22} y={92}>connections   {'{FDI: [FDI]}'}</text>
      <text className="t3" x={22} y={118}>INITIALISED ON FIRST SAVE</text>
      <path className="ln" d="M228 73 H250 M250 28 V148" />
      {records.map((r, i) => (
        <g key={r}>
          <Arrow d={`M250 ${28 + i * 40} H268`} />
          <Box x={270} y={12 + i * 40} w={170} h={32} title={r} />
        </g>
      ))}
      <Arrow d="M118 134 V188" />
      <rect className="bx" x={8} y={190} width={300} height={118} />
      <text className="tb" x={22} y={212}>MultiTeethSession</text>
      <text className="t2" x={22} y={234}>teeth  ⟷  Tooth (FDI)</text>
      <text className="t2" x={22} y={252}>works  ⟷  Work</text>
      <rect className="bxr" x={16} y={262} width={284} height={30} />
      <text className="rt" x={26} y={281}>works_prices  {'{frozen snapshot}'}</text>
      <Arrow d="M308 215 H358" />
      <Box x={360} y={192} w={130} h={46} title="Tooth" sub="FDI code" />
      <Arrow d="M308 277 H358" />
      <Box x={360} y={254} w={130} h={46} title="Work" sub="price list" />
      <Arrow d="M490 277 H508" />
      <Box x={510} y={254} w={122} h={46} title="Classification" sub="colour + icon" />
      <Note x={8} y={326} lines={['prices are copied onto the session at treatment time']} />
    </Svg>
  );
}
