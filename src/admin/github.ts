// Minimal GitHub REST client used by the dashboard. Everything runs in the
// browser with a fine-grained personal access token; there is no server.

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface Change {
  /** Path in the repository, e.g. content/site.json or public/projects/x/desktop.webp */
  path: string;
  /** UTF-8 text content */
  text?: string;
  /** Base64 content for binary files */
  base64?: string;
  /** Remove the file */
  remove?: boolean;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'neutral' | null;
  head_sha: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  display_title?: string;
  head_commit?: { message: string };
}

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API = 'https://api.github.com';

function decodeBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export class GitHub {
  private cfg: RepoConfig;

  constructor(cfg: RepoConfig) {
    this.cfg = cfg;
  }

  get repoPath(): string {
    return `/repos/${this.cfg.owner}/${this.cfg.repo}`;
  }

  get branch(): string {
    return this.cfg.branch;
  }

  async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(API + path, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.cfg.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res.ok) {
      let message = res.statusText || `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        /* keep status text */
      }
      throw new GitHubError(res.status, message);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  repoInfo() {
    return this.req<{ full_name: string; default_branch: string; private: boolean; html_url: string }>(this.repoPath);
  }

  async headSha(): Promise<string> {
    const r = await this.req<{ object: { sha: string } }>(`${this.repoPath}/git/ref/heads/${encodeURIComponent(this.cfg.branch)}`);
    return r.object.sha;
  }

  /** Every file path in the repository at a commit. */
  async listFiles(commitSha: string): Promise<Set<string>> {
    const commit = await this.req<{ tree: { sha: string } }>(`${this.repoPath}/git/commits/${commitSha}`);
    const tree = await this.req<{ tree: { path: string; type: string }[]; truncated: boolean }>(
      `${this.repoPath}/git/trees/${commit.tree.sha}?recursive=1`,
    );
    return new Set(tree.tree.filter((t) => t.type === 'blob').map((t) => t.path));
  }

  async readText(path: string, ref: string): Promise<string> {
    const r = await this.req<{ content: string; encoding: string }>(`${this.repoPath}/contents/${encodePath(path)}?ref=${ref}`);
    return decodeBase64Utf8(r.content);
  }

  /** Writes all changes as a single commit on the branch and returns the new commit SHA. */
  async commit(changes: Change[], message: string): Promise<string> {
    const head = await this.headSha();
    const base = await this.req<{ tree: { sha: string } }>(`${this.repoPath}/git/commits/${head}`);
    const tree: { path: string; mode: string; type: string; sha: string | null }[] = [];
    for (const c of changes) {
      if (c.remove) {
        tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null });
        continue;
      }
      const blob = await this.req<{ sha: string }>(`${this.repoPath}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify(c.base64 !== undefined ? { content: c.base64, encoding: 'base64' } : { content: c.text ?? '', encoding: 'utf-8' }),
      });
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await this.req<{ sha: string }>(`${this.repoPath}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: base.tree.sha, tree }),
    });
    const commit = await this.req<{ sha: string }>(`${this.repoPath}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }),
    });
    await this.req(`${this.repoPath}/git/refs/heads/${encodeURIComponent(this.cfg.branch)}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
    });
    return commit.sha;
  }

  async runs(): Promise<WorkflowRun[]> {
    const r = await this.req<{ workflow_runs: WorkflowRun[] }>(
      `${this.repoPath}/actions/runs?branch=${encodeURIComponent(this.cfg.branch)}&per_page=8`,
    );
    return r.workflow_runs;
  }
}

export function describeError(err: unknown): string {
  if (err instanceof GitHubError) {
    if (err.status === 401) return 'GitHub rejected the token. It may be expired or mistyped.';
    if (err.status === 403) return `GitHub refused the request: ${err.message}. Check the token's permissions for this repository.`;
    if (err.status === 404) return 'Repository, branch or file not found. Check the repository name and that the token can access it.';
    if (err.status === 409 || err.status === 422) return `GitHub could not apply the change (${err.message}). Reload the dashboard and try again.`;
    return `GitHub error ${err.status}: ${err.message}`;
  }
  if (err instanceof TypeError) return 'Network error. Check your connection and try again.';
  return err instanceof Error ? err.message : String(err);
}
