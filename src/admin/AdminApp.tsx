'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import type { Project, Site } from '@/lib/types';
import { normalizeProject, normalizeSite } from '@/lib/normalize';
import { asset, BASE_PATH } from '@/lib/paths';
import ProjectCard from '@/components/ProjectCard';
import CaseStudy from '@/components/CaseStudy';
import { GitHub, GitHubError, describeError, type Change, type RepoConfig, type WorkflowRun } from './github';
import { Fields, type FieldCtx, type Obj, type UploadSpec } from './Fields';
import { PROJECT_TABS, SITE_TABS, emptyProject } from './schema';
import { formatBytes, processImage, processPdf } from './files';
import s from './admin.module.css';

const STORE_KEY = 'ga-dashboard';
const ENV_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || '';
const ENV_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── helpers ─────────────────────────────────────────────

function readConfig(): RepoConfig | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY) || localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as RepoConfig) : null;
  } catch {
    return null;
  }
}

function writeConfig(cfg: RepoConfig, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(STORE_KEY, JSON.stringify(cfg));
  } catch {
    /* storage blocked: the session still works until the tab closes */
  }
}

function clearConfig() {
  try {
    sessionStorage.removeItem(STORE_KEY);
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* nothing stored */
  }
}

/** Drops empty lines from string lists and trims them, recursively. */
function clean<T>(v: T): T {
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === 'string')) {
      return (v as string[]).map((x) => x.trim()).filter(Boolean) as unknown as T;
    }
    return v.map((x) => clean(x)) as unknown as T;
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = clean(val);
    return out as T;
  }
  return v;
}

const toJson = (v: unknown) => `${JSON.stringify(clean(v), null, 2)}\n`;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Public file paths referenced anywhere in a document. */
function collectPaths(v: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof v === 'string') {
    if (/^\/(images|projects|cv)\//.test(v)) out.add(v);
  } else if (Array.isArray(v)) {
    v.forEach((x) => collectPaths(x, out));
  } else if (v && typeof v === 'object') {
    Object.values(v as Record<string, unknown>).forEach((x) => collectPaths(x, out));
  }
  return out;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function timeAgo(iso: string): string {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

function siteUrl(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.origin}${BASE_PATH}/`;
}

type View = { kind: 'site'; tab: string } | { kind: 'projects' } | { kind: 'project'; slug: string; tab: string } | { kind: 'deploys' };

interface Pending {
  repoPath: string;
  base64: string;
  bytes: number;
}

interface Notice {
  tone: 'ok' | 'error' | 'info';
  text: string;
}

interface DeployState {
  sha: string;
  run?: WorkflowRun;
  error?: string;
}

const docKeyOf = (v: View) => (v.kind === 'site' ? 'site' : v.kind === 'project' ? `project:${v.slug}` : v.kind);

// ── entry ───────────────────────────────────────────────

export default function AdminApp() {
  const [cfg, setCfg] = useState<RepoConfig | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCfg(readConfig());
    setReady(true);
  }, []);

  if (!ready) return <div className={s.boot}>Loading dashboard…</div>;
  if (!cfg)
    return (
      <Login
        onConnect={(c, remember) => {
          writeConfig(c, remember);
          setCfg(c);
        }}
      />
    );
  return (
    <Dashboard
      cfg={cfg}
      onSignOut={() => {
        clearConfig();
        setCfg(null);
      }}
    />
  );
}

// ── sign in ─────────────────────────────────────────────

function Login({ onConnect }: { onConnect: (cfg: RepoConfig, remember: boolean) => void }) {
  const [repo, setRepo] = useState(ENV_REPO);
  const [branch, setBranch] = useState(ENV_BRANCH);
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const [owner, name] = repo
      .trim()
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '')
      .split('/');
    if (!owner || !name) {
      setError('Enter the repository as owner/name, for example GhaithAudi/GhaithAudi.github.io.');
      return;
    }
    if (!token.trim()) {
      setError('Paste your GitHub access token.');
      return;
    }
    const next: RepoConfig = { owner, repo: name, branch: branch.trim() || 'main', token: token.trim() };
    setBusy(true);
    setError('');
    try {
      const gh = new GitHub(next);
      await gh.repoInfo();
      await gh.headSha();
      onConnect(next, remember);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.loginWrap}>
      <form className={s.login} onSubmit={submit}>
        <div className={s.loginHead}>
          <span className={s.mark}>GA</span>
          <div>
            <h1>Portfolio dashboard</h1>
            <p>Edits are saved as commits to your GitHub repository, then the site rebuilds itself.</p>
          </div>
        </div>
        <div className={s.field}>
          <label htmlFor="repo">Repository</label>
          <input id="repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="GhaithAudi/GhaithAudi.github.io" autoComplete="off" />
        </div>
        <div className={s.field}>
          <label htmlFor="branch">Branch</label>
          <input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" autoComplete="off" />
        </div>
        <div className={s.field}>
          <label htmlFor="token">Access token</label>
          <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" autoComplete="off" />
          <p className={s.help}>
            A fine-grained token limited to this one repository, with <b>Contents: read and write</b> and <b>Actions: read</b>.{' '}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              Create one on GitHub ↗
            </a>
          </p>
        </div>
        <label className={s.toggle} htmlFor="remember">
          <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember on this device</span>
        </label>
        <p className={s.help}>Without this, you are signed out when you close the tab. The token never leaves your browser except to talk to GitHub.</p>
        {error ? <p className={s.error}>{error}</p> : null}
        <button type="submit" className={s.btnPrimary} disabled={busy}>
          {busy ? 'Connecting…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ── dashboard ───────────────────────────────────────────

function Dashboard({ cfg, onSignOut }: { cfg: RepoConfig; onSignOut: () => void }) {
  const gh = useMemo(() => new GitHub(cfg), [cfg]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [files, setFiles] = useState<Set<string>>(new Set());
  const [site, setSite] = useState<Site | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  const [view, setView] = useState<View>({ kind: 'projects' });
  const [draftKey, setDraftKey] = useState('');
  const [draft, setDraft] = useState<Obj | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [pending, setPending] = useState<Record<string, Pending>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deploy, setDeploy] = useState<DeployState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const sha = await gh.headSha();
      const all = await gh.listFiles(sha);
      const siteText = await gh.readText('content/site.json', sha);
      const paths = [...all].filter((p) => /^content\/projects\/[^/]+\.json$/.test(p));
      const texts = await Promise.all(paths.map((p) => gh.readText(p, sha)));
      const list = texts
        .map((t, i) => normalizeProject(JSON.parse(t) as Partial<Project>, (paths[i].split('/').pop() || '').replace(/\.json$/, '')))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      setFiles(all);
      setSite(normalizeSite(JSON.parse(siteText) as Partial<Site>));
      setProjects(list);
      setOrder(list.map((p) => p.slug));
    } catch (e) {
      setLoadError(describeError(e));
    } finally {
      setLoading(false);
    }
  }, [gh]);

  useEffect(() => {
    load();
  }, [load]);

  const savedDoc = useMemo<Obj | null>(() => {
    if (draftKey === 'site') return site as unknown as Obj | null;
    if (draftKey.startsWith('project:')) {
      const p = projects.find((x) => `project:${x.slug}` === draftKey);
      return (p as unknown as Obj) ?? null;
    }
    return null;
  }, [draftKey, site, projects]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (isNew || !savedDoc) return true;
    return toJson(draft) !== toJson(savedDoc);
  }, [draft, savedDoc, isNew]);

  const orderDirty = order.join('|') !== projects.map((p) => p.slug).join('|');
  const unsaved = dirty || orderDirty;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!unsaved) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  const go = (next: View, force = false) => {
    const nextKey = docKeyOf(next);
    const leavingDoc = nextKey !== draftKey;
    if (!force && leavingDoc && unsaved && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    if (leavingDoc) {
      if (orderDirty) setOrder(projects.map((p) => p.slug));
      if (next.kind === 'site') setDraft(site ? (clone(site) as unknown as Obj) : null);
      else if (next.kind === 'project') {
        const p = projects.find((x) => x.slug === next.slug);
        setDraft(p ? (clone(p) as unknown as Obj) : null);
      } else setDraft(null);
      setIsNew(false);
      setDraftKey(nextKey);
    }
    setView(next);
    setNotice(null);
    window.scrollTo({ top: 0 });
  };

  const resolve = useCallback((p: string) => previews[p] || asset(p), [previews]);

  const upload = useCallback(
    async (spec: UploadSpec, file: File) => {
      const processed = spec.kind === 'pdf' ? await processPdf(file) : await processImage(file, spec.maxWidth ?? 1600, spec.maxHeight);
      const stamp = Date.now().toString(36);
      let publicPath: string;
      if (spec.kind === 'pdf') publicPath = `/cv/cv-${stamp}.pdf`;
      else if (draftKey.startsWith('project:')) publicPath = `/projects/${draftKey.slice(8)}/${spec.name}-${stamp}.${processed.ext}`;
      else publicPath = `/images/${spec.name}-${stamp}.${processed.ext}`;
      setPending((prev) => ({ ...prev, [publicPath]: { repoPath: `public${publicPath}`, base64: processed.base64, bytes: processed.bytes } }));
      setPreviews((prev) => ({ ...prev, [publicPath]: processed.dataUrl }));
      setNotice({ tone: 'info', text: `${spec.kind === 'pdf' ? 'PDF' : 'Image'} ready (${formatBytes(processed.bytes)}). It goes live when you save.` });
      return publicPath;
    },
    [draftKey],
  );

  const ctx: FieldCtx = { resolve, upload };

  const afterCommit = (changes: Change[]) => {
    setFiles((prev) => {
      const n = new Set(prev);
      changes.forEach((c) => (c.remove ? n.delete(c.path) : n.add(c.path)));
      return n;
    });
    setPending((prev) => {
      const n = { ...prev };
      changes.forEach((c) => delete n[c.path.replace(/^public/, '')]);
      return n;
    });
  };

  const runCommit = async (changes: Change[], message: string): Promise<boolean> => {
    setSaving(true);
    setNotice(null);
    try {
      const sha = await gh.commit(changes, message);
      afterCommit(changes);
      setDeploy({ sha });
      setNotice({ tone: 'ok', text: 'Saved to GitHub. The site is rebuilding and will be live in about two minutes.' });
      return true;
    } catch (e) {
      setNotice({ tone: 'error', text: describeError(e) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!draft || !draftKey) return;
    const doc = clean(draft);
    let path: string;
    let message: string;
    let owns: (p: string) => boolean;
    if (draftKey === 'site') {
      path = 'content/site.json';
      message = 'content: update site';
      owns = (p) => p.startsWith('/images/') || p.startsWith('/cv/');
    } else {
      const slug = String(doc.slug || '');
      const name = String(doc.name || '').trim();
      if (!name) return setNotice({ tone: 'error', text: 'Give the project a name before saving.' });
      if (!SLUG_RE.test(slug)) return setNotice({ tone: 'error', text: 'The slug may only use lowercase letters, numbers and single hyphens.' });
      path = `content/projects/${slug}.json`;
      message = `content: ${isNew ? 'add' : 'update'} ${name}`;
      owns = (p) => p.startsWith(`/projects/${slug}/`);
    }
    const json = toJson(doc);
    const changes: Change[] = [{ path, text: json }];
    for (const [pub, up] of Object.entries(pending)) {
      if (json.includes(`"${pub}"`)) changes.push({ path: up.repoPath, base64: up.base64 });
    }
    if (savedDoc && !isNew) {
      const after = collectPaths(doc);
      collectPaths(savedDoc).forEach((p) => {
        if (!after.has(p) && owns(p) && files.has(`public${p}`)) changes.push({ path: `public${p}`, remove: true });
      });
    }
    const ok = await runCommit(changes, message);
    if (!ok) return;
    if (draftKey === 'site') {
      setSite(normalizeSite(doc as Partial<Site>));
    } else {
      const p = normalizeProject(doc as Partial<Project>);
      const list = [...projects.filter((x) => x.slug !== p.slug), p].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      setProjects(list);
      setOrder(list.map((x) => x.slug));
      setIsNew(false);
    }
    setDraft(clone(doc));
  };

  const discard = () => {
    if (!window.confirm('Discard your unsaved changes?')) return;
    if (isNew) {
      setDraft(null);
      setDraftKey('projects');
      setIsNew(false);
      setView({ kind: 'projects' });
      return;
    }
    setDraft(savedDoc ? clone(savedDoc) : null);
    setNotice(null);
  };

  const saveOrder = async () => {
    const updated = order.map((slug, i) => ({ ...(projects.find((p) => p.slug === slug) as Project), order: i + 1 }));
    const changes: Change[] = updated
      .filter((p) => projects.find((x) => x.slug === p.slug)?.order !== p.order)
      .map((p) => ({ path: `content/projects/${p.slug}.json`, text: toJson(p) }));
    if (!changes.length) return;
    const ok = await runCommit(changes, 'content: reorder projects');
    if (ok) setProjects(updated);
  };

  const createProject = (name: string, slug: string) => {
    if (unsaved && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    const nextOrder = projects.reduce((m, p) => Math.max(m, p.order), 0) + 1;
    setDraft(emptyProject(slug, name, nextOrder) as unknown as Obj);
    setDraftKey(`project:${slug}`);
    setIsNew(true);
    setOrder(projects.map((p) => p.slug));
    setView({ kind: 'project', slug, tab: 'card' });
    setNotice({ tone: 'info', text: 'New project. Fill in the card, then save to publish it.' });
  };

  const deleteProject = async (p: Project) => {
    if (!window.confirm(`Delete “${p.name}”? Its case study page and uploaded images are removed from the site.`)) return;
    const changes: Change[] = [
      { path: `content/projects/${p.slug}.json`, remove: true },
      ...[...files].filter((f) => f.startsWith(`public/projects/${p.slug}/`)).map((f) => ({ path: f, remove: true })),
    ];
    const ok = await runCommit(changes, `content: remove ${p.name}`);
    if (!ok) return;
    const list = projects.filter((x) => x.slug !== p.slug);
    setProjects(list);
    setOrder(list.map((x) => x.slug));
    setDraft(null);
    setDraftKey('projects');
    setView({ kind: 'projects' });
  };

  // Follow the deploy triggered by the last save.
  useEffect(() => {
    if (!deploy?.sha) return;
    const sha = deploy.sha;
    let stopped = false;
    let tries = 0;
    let timer: number | undefined;
    const tick = async () => {
      if (stopped) return;
      tries += 1;
      try {
        const run = (await gh.runs()).find((r) => r.head_sha === sha);
        if (run) setDeploy((d) => (d && d.sha === sha ? { ...d, run } : d));
        if (run?.status === 'completed') return;
      } catch (e) {
        const msg = e instanceof GitHubError && e.status === 403 ? 'no-permission' : describeError(e);
        setDeploy((d) => (d && d.sha === sha ? { ...d, error: msg } : d));
        return;
      }
      if (tries < 100) timer = window.setTimeout(tick, 6000);
    };
    timer = window.setTimeout(tick, 4000);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [deploy?.sha, gh]);

  // ── render ────────────────────────────────────────────

  if (loading) return <div className={s.boot}>Loading content from GitHub…</div>;

  if (loadError || !site) {
    return (
      <div className={s.loginWrap}>
        <div className={s.login}>
          <h1>Couldn&apos;t load the content</h1>
          <p className={s.error}>{loadError || 'content/site.json is missing from the repository.'}</p>
          <div className={s.row}>
            <button type="button" className={s.btnPrimary} onClick={load}>
              Try again
            </button>
            <button type="button" className={s.btnGhost} onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProject = view.kind === 'project' ? (draft as unknown as Project | null) : null;
  const projectIndex = currentProject ? Math.max(0, order.indexOf(currentProject.slug)) : 0;
  const siteTab = view.kind === 'site' ? SITE_TABS.find((t) => t.id === view.tab) ?? SITE_TABS[0] : null;
  const title =
    view.kind === 'site'
      ? siteTab?.label
      : view.kind === 'projects'
        ? 'Projects'
        : view.kind === 'deploys'
          ? 'Deploys'
          : isNew
            ? `New project · ${String(draft?.name || '')}`
            : String(draft?.name || 'Project');
  const cvMissing = !site.cv || !files.has(`public${site.cv}`);

  return (
    <div className={s.app}>
      <aside className={s.side}>
        <div className={s.brand}>
          <span className={s.mark}>GA</span>
          <div>
            <b>Dashboard</b>
            <small>
              {cfg.owner}/{cfg.repo}
            </small>
          </div>
        </div>
        <nav className={s.nav} aria-label="Dashboard">
          <p className={s.navLabel}>Site</p>
          {SITE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={view.kind === 'site' && view.tab === t.id ? s.navActive : undefined}
              onClick={() => go({ kind: 'site', tab: t.id })}
            >
              {t.label}
            </button>
          ))}
          <p className={s.navLabel}>Projects</p>
          <button type="button" className={view.kind === 'projects' ? s.navActive : undefined} onClick={() => go({ kind: 'projects' })}>
            All projects <span className={s.count}>{projects.length}</span>
          </button>
          {order.map((slug, i) => {
            const p = projects.find((x) => x.slug === slug);
            if (!p) return null;
            return (
              <button
                key={slug}
                type="button"
                className={`${s.navSub} ${view.kind === 'project' && view.slug === slug ? s.navActive : ''}`}
                onClick={() => go({ kind: 'project', slug, tab: 'card' })}
              >
                <span className={s.navNo}>{String(i + 1).padStart(2, '0')}</span>
                {p.name}
              </button>
            );
          })}
          <p className={s.navLabel}>Publishing</p>
          <button type="button" className={view.kind === 'deploys' ? s.navActive : undefined} onClick={() => go({ kind: 'deploys' })}>
            Deploys
          </button>
        </nav>
        <div className={s.sideFoot}>
          <a href={siteUrl()} target="_blank" rel="noreferrer">
            View live site ↗
          </a>
          <button type="button" className={s.linkBtn} onClick={() => (!unsaved || window.confirm('Sign out and lose unsaved changes?')) && onSignOut()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.topbar}>
          <div className={s.topTitle}>
            <h1>{title}</h1>
            {dirty ? <span className={s.dirty}>Unsaved changes</span> : null}
          </div>
          <div className={s.topActions}>
            <DeployChip deploy={deploy} />
            {draft ? (
              <>
                <button type="button" className={s.btnGhost} onClick={discard} disabled={!dirty || saving}>
                  Discard
                </button>
                <button type="button" className={s.btnPrimary} onClick={save} disabled={!dirty || saving}>
                  {saving ? 'Saving…' : 'Save & publish'}
                </button>
              </>
            ) : null}
            {view.kind === 'projects' && orderDirty ? (
              <button type="button" className={s.btnPrimary} onClick={saveOrder} disabled={saving}>
                {saving ? 'Saving…' : 'Save order'}
              </button>
            ) : null}
          </div>
        </div>

        {notice ? (
          <p className={`${s.notice} ${notice.tone === 'error' ? s.noticeError : notice.tone === 'ok' ? s.noticeOk : ''}`} role="status">
            {notice.text}
          </p>
        ) : null}

        {view.kind === 'site' && draft && siteTab ? (
          <div className={s.panel}>
            {siteTab.id === 'contact' && cvMissing ? (
              <p className={s.warn}>No CV is published yet, so the Download CV buttons are hidden on the site. Upload a PDF below and save.</p>
            ) : null}
            <Fields fields={siteTab.fields} value={draft} onChange={setDraft} ctx={ctx} />
          </div>
        ) : null}

        {view.kind === 'projects' ? (
          <ProjectsList
            projects={projects}
            order={order}
            setOrder={setOrder}
            onOpen={(slug) => go({ kind: 'project', slug, tab: 'card' })}
            onCreate={createProject}
          />
        ) : null}

        {view.kind === 'project' && draft && currentProject ? (
          <>
            <div className={s.tabs} role="tablist" aria-label="Project sections">
              {[...PROJECT_TABS.map((t) => ({ id: t.id, label: t.label })), { id: 'preview', label: 'Preview' }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={view.tab === t.id}
                  className={view.tab === t.id ? s.tabActive : undefined}
                  onClick={() => setView({ kind: 'project', slug: view.slug, tab: t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {view.tab === 'preview' ? (
              <ProjectPreview draft={draft} index={projectIndex} resolve={resolve} />
            ) : (
              <div className={s.panel}>
                <Fields fields={(PROJECT_TABS.find((t) => t.id === view.tab) ?? PROJECT_TABS[0]).fields} value={draft} onChange={setDraft} ctx={ctx} />
              </div>
            )}
            {!isNew ? (
              <div className={s.danger}>
                <div>
                  <b>Delete this project</b>
                  <p>Removes the card, the case study page and its uploaded images.</p>
                </div>
                <button
                  type="button"
                  className={s.btnDanger}
                  disabled={saving}
                  onClick={() => {
                    const p = projects.find((x) => x.slug === view.slug);
                    if (p) deleteProject(p);
                  }}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {view.kind === 'deploys' ? <Deploys gh={gh} /> : null}
      </main>
    </div>
  );
}

// ── projects list ───────────────────────────────────────

function ProjectsList({
  projects,
  order,
  setOrder,
  onOpen,
  onCreate,
}: {
  projects: Project[];
  order: string[];
  setOrder: (o: string[]) => void;
  onOpen: (slug: string) => void;
  onCreate: (name: string, slug: string) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState('');

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  const create = (e: FormEvent) => {
    e.preventDefault();
    const finalSlug = slug || slugify(name);
    if (!name.trim()) return setError('Enter a project name.');
    if (!SLUG_RE.test(finalSlug)) return setError('The slug may only use lowercase letters, numbers and single hyphens.');
    if (projects.some((p) => p.slug === finalSlug)) return setError('A project with this slug already exists.');
    setError('');
    onCreate(name.trim(), finalSlug);
  };

  return (
    <div className={s.panel}>
      <p className={s.help}>The first project with “Featured” on shows as a full-width card. Reorder with the arrows, then save the order.</p>
      <ol className={s.projectList}>
        {order.map((slug, i) => {
          const p = projects.find((x) => x.slug === slug);
          if (!p) return null;
          return (
            <li key={slug}>
              <span className={s.navNo}>{String(i + 1).padStart(2, '0')}</span>
              <div className={s.projectMeta}>
                <b>{p.name}</b>
                <small>
                  {p.category} · {p.status === 'private' ? 'Private deployment' : p.status === 'pilot' ? 'Live pilot' : 'Live'}
                  {p.featured ? ' · Featured' : ''}
                </small>
              </div>
              <div className={s.itemTools}>
                <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.name} up`}>
                  ↑
                </button>
                <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={`Move ${p.name} down`}>
                  ↓
                </button>
                <button type="button" className={s.btn} onClick={() => onOpen(slug)}>
                  Edit
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <form className={s.addForm} onSubmit={create}>
        <h2>Add a project</h2>
        <div className={s.addRow}>
          <div className={s.field}>
            <label htmlFor="new-name">Name</label>
            <input
              id="new-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Autolakta"
            />
          </div>
          <div className={s.field}>
            <label htmlFor="new-slug">URL slug</label>
            <input
              id="new-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="autolakta"
            />
          </div>
          <button type="submit" className={s.btnPrimary}>
            Create
          </button>
        </div>
        {error ? <p className={s.error}>{error}</p> : null}
      </form>
    </div>
  );
}

// ── preview ─────────────────────────────────────────────

function ProjectPreview({ draft, index, resolve }: { draft: Obj; index: number; resolve: (p: string) => string }) {
  const p = normalizeProject(clean(draft) as Partial<Project>);
  // Links inside the preview would navigate away from unsaved edits.
  const block = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  return (
    <div className={s.preview} onClickCapture={block}>
      <p className={s.previewLabel}>Homepage card</p>
      <div className={s.previewCard}>
        <ProjectCard project={p} index={index} wide resolve={resolve} />
      </div>
      <p className={s.previewLabel}>Case study page</p>
      <div className={s.previewPage}>
        <CaseStudy project={p} index={index} resolve={resolve} />
      </div>
    </div>
  );
}

// ── deploy status ───────────────────────────────────────

function DeployChip({ deploy }: { deploy: DeployState | null }) {
  if (!deploy) return null;
  if (deploy.error === 'no-permission')
    return <span className={s.chip}>Saved · add “Actions: read” to the token to see deploy status</span>;
  if (deploy.error) return <span className={`${s.chip} ${s.chipBad}`}>Deploy status unavailable</span>;
  const run = deploy.run;
  if (!run) return <span className={`${s.chip} ${s.chipBusy}`}>Waiting for the build…</span>;
  if (run.status !== 'completed')
    return (
      <a className={`${s.chip} ${s.chipBusy}`} href={run.html_url} target="_blank" rel="noreferrer">
        Deploying…
      </a>
    );
  if (run.conclusion === 'success')
    return (
      <a className={`${s.chip} ${s.chipOk}`} href={siteUrl()} target="_blank" rel="noreferrer">
        Live ✓ View site
      </a>
    );
  return (
    <a className={`${s.chip} ${s.chipBad}`} href={run.html_url} target="_blank" rel="noreferrer">
      Deploy {run.conclusion ?? 'failed'} · open log
    </a>
  );
}

function Deploys({ gh }: { gh: GitHub }) {
  const [runs, setRuns] = useState<WorkflowRun[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const list = await gh.runs();
        if (stopped) return;
        setRuns(list);
        setError('');
        if (list.some((r) => r.status !== 'completed')) timer = window.setTimeout(tick, 8000);
      } catch (e) {
        if (!stopped) setError(e instanceof GitHubError && e.status === 403 ? 'The token needs “Actions: read” permission to show deploys.' : describeError(e));
      }
    };
    tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [gh]);

  if (error) return <p className={`${s.notice} ${s.noticeError}`}>{error}</p>;
  if (!runs) return <p className={s.help}>Loading deploys…</p>;
  if (!runs.length) return <p className={s.help}>No deploys yet. They appear here after the first push to the branch.</p>;
  return (
    <div className={s.panel}>
      <ol className={s.runs}>
        {runs.map((r) => {
          const state = r.status !== 'completed' ? 'Running' : r.conclusion === 'success' ? 'Live' : r.conclusion ?? 'Unknown';
          const tone = r.status !== 'completed' ? s.chipBusy : r.conclusion === 'success' ? s.chipOk : s.chipBad;
          return (
            <li key={r.id}>
              <span className={`${s.chip} ${tone}`}>{state}</span>
              <div className={s.projectMeta}>
                <b>{(r.head_commit?.message || r.display_title || r.name).split('\n')[0]}</b>
                <small>
                  {r.head_sha.slice(0, 7)} · {timeAgo(r.created_at)}
                </small>
              </div>
              <a className={s.btn} href={r.html_url} target="_blank" rel="noreferrer">
                Log ↗
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
