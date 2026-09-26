import { Arrow, Box, Note, Svg } from './primitives';

// Schematics are drawn on a device screen when a project has no public screenshot.
// They describe how the system works; they never imitate a user interface.

export function OvacsStorage() {
  return (
    <Svg w={640} h={400} className="sc" label="Schematic of OVACS storage resolution: new uploads resolve to the workspace's provider, existing files to their own recorded provider, among Google Drive, local disk and Cloudflare R2.">
      <text className="t3" x={24} y={40}>OVACS · STORAGE RESOLUTION</text>
      <Box lg x={24} y={80} w={150} h={56} title="new upload" />
      <Box lg x={24} y={256} w={150} h={56} title="existing file" />
      <Box lg x={206} y={80} w={206} h={56} title="for_upload()" sub="workspace provider" tone="bx2" />
      <Box lg x={206} y={256} w={206} h={56} title="for_document()" sub="file's own provider" tone="bx2" />
      <Arrow d="M174 108 H204" />
      <Arrow d="M174 284 H204" />
      <path className="ln" d="M412 108 H444 M412 284 H444 M444 90 V302" />
      <Arrow d="M444 90 H468" />
      <Arrow d="M444 196 H468" />
      <Arrow d="M444 302 H468" />
      <Box lg x={470} y={62} w={148} h={56} title="Google Drive" sub="customer's own" tone="bxr" />
      <Box lg x={470} y={168} w={148} h={56} title="Local disk" />
      <Box lg x={470} y={274} w={148} h={56} title="Cloudflare R2" sub="fallback" />
      <Note x={24} y={370} lines={['two resolvers, one set of backends']} />
    </Svg>
  );
}

export function LongageStates() {
  const row1 = ['requested', 'offered', 'confirmed', 'en_route'];
  const row2 = ['reported', 'completed', 'in_progress', 'arrived'];
  const xs = [24, 176, 328, 480];
  return (
    <Svg w={640} h={400} className="sc" label="Schematic of the 4longAge booking state machine from requested to rated, with confirmed slots protected against overlap by a database constraint.">
      <text className="t3" x={24} y={40}>4LONGAGE · BOOKING STATE MACHINE</text>
      {row1.map((s, i) => (
        <Box lg key={s} x={xs[i]} y={64} w={132} h={44} title={s} tone={s === 'confirmed' ? 'bxr' : 'bx'} />
      ))}
      {row2.map((s, i) => (
        <Box lg key={s} x={xs[i]} y={164} w={132} h={44} title={s} />
      ))}
      <rect className="bx2" x={24} y={264} width={132} height={44} />
      <rect className="ln" x={28} y={268} width={124} height={36} />
      <text className="tb" x={90} y={291} textAnchor="middle">rated</text>
      <Arrow d="M156 86 H174" />
      <Arrow d="M308 86 H326" />
      <Arrow d="M460 86 H478" />
      <Arrow d="M546 108 V162" />
      <Arrow d="M480 186 H462" />
      <Arrow d="M328 186 H310" />
      <Arrow d="M176 186 H158" />
      <Arrow d="M90 208 V262" />
      <Note x={190} y={286} lines={["confirmed slots can't overlap:", 'EXCLUDE (provider =, slot &&)']} step={20} />
      <text className="t2" x={24} y={368}>13 statuses · one transition() gateway</text>
    </Svg>
  );
}

export function Gt06() {
  const cells = [
    { x: 24, w: 86, label: 'start', value: '78 78', tone: 'bx2' },
    { x: 110, w: 58, label: 'len', value: 'L', tone: 'bx' },
    { x: 168, w: 66, label: 'proto', value: '12', tone: 'bx' },
    { x: 234, w: 176, label: 'information', value: 'lat · lon · speed', tone: 'bx', small: true },
    { x: 410, w: 76, label: 'serial', value: '00 2A', tone: 'bx' },
    { x: 486, w: 70, label: 'check', value: 'CRC', tone: 'bxr' },
    { x: 556, w: 60, label: 'stop', value: '0D 0A', tone: 'bx2' },
  ];
  const bytes = ['2', '1', '1', 'N', '2', '2', '2'];
  return (
    <Svg w={640} h={400} className="sc" label="Schematic of a GT06 GPS tracker packet: start bits, length, protocol number, information content, serial number, CRC-ITU check and stop bits.">
      <text className="t3" x={24} y={40}>GT06 PACKET · READ OFF THE SOCKET</text>
      {cells.map((c, i) => (
        <g key={c.label}>
          <text className="t2" x={c.x + c.w / 2} y={94} textAnchor="middle">{c.label}</text>
          <rect className={c.tone} x={c.x} y={104} width={c.w} height={64} />
          <text className={c.small ? 't2' : 'tb'} x={c.x + c.w / 2} y={142} textAnchor="middle">{c.value}</text>
          <path className="ln" d={`M${c.x + 4} 186 v12 M${c.x + c.w - 4} 186 v12 M${c.x + 4} 192 H${c.x + c.w - 4}`} />
          <text className="t2" x={c.x + c.w / 2} y={218} textAnchor="middle">{bytes[i]}</text>
        </g>
      ))}
      <path className="r" d="M110 234 v10 H486 v-10 M298 244 v10" />
      <text className="rt" x={298} y={276} textAnchor="middle">CRC-ITU over length → serial</text>
      <text className="t2" x={24} y={330}>0x01 login · 0x12 location · 0x13 heartbeat · 0x16 alarm</text>
      <text className="t2" x={24} y={356}>one asyncio task per tracker · 300 s read timeout</text>
    </Svg>
  );
}

export function Geofence() {
  const cx = 150;
  const cy = 300;
  const r = 110;
  const walk = [
    [40, 560],
    [70, 500],
    [96, 452],
    [135, 360],
    [146, 322],
  ];
  const leave = [
    [168, 282],
    [198, 252],
    [250, 196],
    [270, 160],
  ];
  return (
    <Svg w={300} h={650} className="sc" label="Schematic of a geofence: a circle around a site; crossing the boundary inward records a check-in and outward a check-out.">
      <text className="t3" x={20} y={56}>GEOFENCE</text>
      <text className="t2" x={20} y={80}>automatic attendance</text>
      <circle className="bxr" cx={cx} cy={cy} r={r} strokeDasharray="6 5" />
      <circle className="dotf" cx={cx} cy={cy} r={5} />
      <path className="ln-soft" d={`M${cx} ${cy} H${cx + r}`} />
      <text className="t2" x={cx + r / 2} y={cy - 8} textAnchor="middle">radius</text>
      {walk.map(([x, y]) => (
        <circle key={`${x}-${y}`} className="dotf" cx={x} cy={y} r={3.5} />
      ))}
      {leave.map(([x, y]) => (
        <circle key={`${x}-${y}`} className="dotf" cx={x} cy={y} r={3.5} />
      ))}
      <circle className="r" cx={118} cy={407} r={9} />
      <circle className="r" cx={228} cy={222} r={9} />
      <Note x={20} y={438} lines={['entry', '→ check-in']} step={18} />
      <Note x={196} y={138} lines={['exit', '→ check-out']} step={18} />
      <text className="t2" x={20} y={600}>scored on distance, accuracy,</text>
      <text className="t2" x={20} y={620}>mock location and speed</text>
    </Svg>
  );
}

export function NakabaCalc() {
  const lines = [
    'مجموع التوريدات لسنة {year} (كَ 6%) : {year_income}',
    'الحد الأدنى في ذلك العام للعمر الهندسي {eng_age} : {minimum}',
    'التوريدات أقل من الحد الأدنى في ذلك العام',
    'عدد السنوات المتأخرة : {late_years}',
  ];
  return (
    <Svg w={640} h={400} className="sc" label="Schematic of a Nakaba Central pension calculation: each step of the result is explained in plain Arabic, ending with the amount due.">
      <text className="t3" x={24} y={40}>PENSION ENGINE · EVERY FIGURE EXPLAINED IN ARABIC</text>
      <rect className="bx" x={24} y={58} width={592} height={250} />
      {lines.map((l, i) => (
        <text key={i} className="ar" x={596} y={104 + i * 40} direction="rtl" textAnchor="start">
          {l}
        </text>
      ))}
      <path className="dash" d="M44 250 H596" />
      <text className="ar" x={596} y={286} direction="rtl" textAnchor="start" style={{ fill: 'var(--red)', fontWeight: 700 }}>
        العائدات المطلوبة = الفرق + الغرامة : {'{required}'}
      </text>
      <text className="t2" x={24} y={344}>one line per step · 10 templates · 5 engines</text>
      <text className="t2" x={24} y={370}>6% contributions vs. legal minimum · 8% yearly penalty</text>
    </Svg>
  );
}

export function FdiChart() {
  const step = 36;
  const left = 26;
  const right = 330;
  const upper = 80;
  const lower = 196;
  const session = new Set([16, 17]);
  const teeth: { n: number; x: number; y: number; up: boolean }[] = [];
  for (let i = 0; i < 8; i++) {
    teeth.push({ n: 18 - i, x: left + i * step, y: upper, up: true });
    teeth.push({ n: 21 + i, x: right + i * step, y: upper, up: true });
    teeth.push({ n: 48 - i, x: left + i * step, y: lower, up: false });
    teeth.push({ n: 31 + i, x: right + i * step, y: lower, up: false });
  }
  return (
    <Svg w={640} h={400} className="sc" label="Schematic of an FDI dental chart: quadrants 1 to 4, teeth numbered by quadrant and position, with teeth 16 and 17 highlighted as one treatment session.">
      <text className="t3" x={24} y={40}>FDI TOOTH NOTATION · DENTAL CHART</text>
      <text className="t3" x={left} y={70}>1 · UPPER RIGHT</text>
      <text className="t3" x={right} y={70}>2 · UPPER LEFT</text>
      <text className="t3" x={left} y={264}>4 · LOWER RIGHT</text>
      <text className="t3" x={right} y={264}>3 · LOWER LEFT</text>
      <path className="dash" d="M320 58 V250" />
      <path className="dash" d="M26 160 H614" />
      {teeth.map((t) => {
        const hot = session.has(t.n);
        const tone = hot ? 'bxr' : t.n === 46 ? 'bxh' : 'bx';
        return (
          <g key={t.n}>
            <rect className={tone} x={t.x} y={t.y} width={32} height={46} rx={4} />
            <text className={hot ? 'tb' : 't2'} x={t.x + 16} y={t.up ? t.y + 34 : t.y + 20} textAnchor="middle">
              {t.n}
            </text>
            {t.n === 26 ? <circle className="dotf" cx={t.x + 16} cy={t.y + 14} r={5} /> : null}
            {t.n === 36 ? <path className="dotf" d={`M${t.x + 16} ${t.y + 26} l6 7 -6 7 -6 -7z`} /> : null}
          </g>
        );
      })}
      <path className="r" d="M62 132 v6 H130 v-6" />
      <text className="rt" x={138} y={142}>one session</text>
      <text className="rt" x={24} y={306}>teeth 16 + 17 in one session · prices frozen at treatment time</text>
      <text className="t2" x={24} y={332}>32 permanent + 20 primary teeth</text>
    </Svg>
  );
}
