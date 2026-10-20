// Dados públicos do GitHub: perfil e repositórios (API REST oficial, sem token)
// e contribuições do último ano (mesmo serviço da cobrinha). Tudo com cache local.
import { fetchGrid, type ContributionGrid } from '../snake/contributions';

export interface Profile {
  login: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  blog: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  url: string;
}

export interface Repo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  pushedAt: string;
  url: string;
  fork: boolean;
  topics: string[];
}

const CACHE_MS = 60 * 60 * 1000;

/** Lê do cache local uma resposta guardada há menos de 1 hora. */
function cached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: T };
    return Date.now() - at < CACHE_MS ? data : null;
  } catch {
    return null;
  }
}

/** Guarda uma resposta no cache local (ignora erro de armazenamento). */
function store(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* sem armazenamento: só não usa cache */
  }
}

/** GET na API do GitHub com mensagens de erro amigáveis. */
async function gh<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  } catch {
    throw new Error('Could not reach GitHub (network blocked or offline).');
  }
  if (res.status === 404) throw new Error('GitHub user or repository not found.');
  if (res.status === 403 || res.status === 429) throw new Error('GitHub rate limit reached. It resets within an hour.');
  if (!res.ok) throw new Error('GitHub did not answer. Try again later.');
  return res.json() as Promise<T>;
}

/** Valida o nome de usuário (letras, números e hífen). */
function checkUser(user: string): void {
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user)) {
    throw new Error(`"${user}" is not a valid GitHub username (only letters, numbers and "-").`);
  }
}

// ---------- dados de demonstração (user=demo) ----------

const DEMO_PROFILE: Profile = {
  login: 'demo', name: 'Demo Dev', avatar: '', bio: 'CS student · systems, games and tools',
  location: 'Brasília, BR', blog: '', followers: 42, following: 31, publicRepos: 18,
  createdAt: '2022-03-14T12:00:00Z', url: 'https://github.com',
};

const DEMO_REPOS: Repo[] = [
  { name: 'The-Last-Lightkeeper', fullName: 'demo/The-Last-Lightkeeper', description: 'Top-down horror survival game and engine in C++/SDL2', language: 'C++', stars: 12, forks: 3, pushedAt: new Date(Date.now() - 2 * 864e5).toISOString(), url: '#', fork: false, topics: ['game', 'sdl2'] },
  { name: 'Notion_Widgets', fullName: 'demo/Notion_Widgets', description: 'Embeddable widgets for Notion: clock, timer, weather, snake', language: 'Svelte', stars: 8, forks: 1, pushedAt: new Date(Date.now() - 3600e3).toISOString(), url: '#', fork: false, topics: ['notion', 'svelte'] },
  { name: 'image-processing', fullName: 'demo/image-processing', description: 'Course project: filters and transforms', language: 'Python', stars: 4, forks: 0, pushedAt: new Date(Date.now() - 20 * 864e5).toISOString(), url: '#', fork: false, topics: [] },
  { name: 'pomodoro-overlay', fullName: 'demo/pomodoro-overlay', description: 'Desktop focus timer overlay', language: 'TypeScript', stars: 3, forks: 0, pushedAt: new Date(Date.now() - 40 * 864e5).toISOString(), url: '#', fork: false, topics: ['tauri'] },
  { name: 'dotfiles', fullName: 'demo/dotfiles', description: 'My terminal setup', language: 'Shell', stars: 1, forks: 0, pushedAt: new Date(Date.now() - 90 * 864e5).toISOString(), url: '#', fork: false, topics: [] },
  { name: 'algorithms', fullName: 'demo/algorithms', description: 'PAA exercises', language: 'C', stars: 2, forks: 0, pushedAt: new Date(Date.now() - 9 * 864e5).toISOString(), url: '#', fork: false, topics: [] },
];

// ---------- busca ----------

/** Perfil público do usuário. */
export async function fetchProfile(user: string): Promise<Profile> {
  if (user.toLowerCase() === 'demo') return DEMO_PROFILE;
  checkUser(user);
  const key = `gh:profile:${user.toLowerCase()}`;
  const hit = cached<Profile>(key);
  if (hit) return hit;
  const u = await gh<Record<string, string & number>>(`/users/${user}`);
  const profile: Profile = {
    login: u.login, name: u.name || u.login, avatar: u.avatar_url, bio: u.bio || '',
    location: u.location || '', blog: u.blog || '', followers: u.followers, following: u.following,
    publicRepos: u.public_repos, createdAt: u.created_at, url: u.html_url,
  };
  store(key, profile);
  return profile;
}

/** Repositórios públicos do usuário (até 100, os mais recentes primeiro). */
export async function fetchRepos(user: string): Promise<Repo[]> {
  if (user.toLowerCase() === 'demo') return DEMO_REPOS;
  checkUser(user);
  const key = `gh:repos:${user.toLowerCase()}`;
  const hit = cached<Repo[]>(key);
  if (hit) return hit;
  const list = await gh<Record<string, never>[]>(`/users/${user}/repos?per_page=100&sort=pushed`);
  const repos = list.map(toRepo);
  store(key, repos);
  return repos;
}

/** Um repositório específico ("dono/nome"). */
export async function fetchRepo(fullName: string): Promise<Repo> {
  const key = `gh:repo:${fullName.toLowerCase()}`;
  const hit = cached<Repo>(key);
  if (hit) return hit;
  if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) throw new Error(`Use the repo as "owner/name" (got "${fullName}").`);
  const repo = toRepo(await gh<Record<string, never>>(`/repos/${fullName}`));
  store(key, repo);
  return repo;
}

/** Converte a resposta crua da API num Repo. */
function toRepo(r: Record<string, never>): Repo {
  const raw = r as unknown as Record<string, unknown>;
  return {
    name: raw.name as string,
    fullName: raw.full_name as string,
    description: (raw.description as string) || '',
    language: (raw.language as string) || '',
    stars: raw.stargazers_count as number,
    forks: raw.forks_count as number,
    pushedAt: raw.pushed_at as string,
    url: raw.html_url as string,
    fork: raw.fork as boolean,
    topics: (raw.topics as string[]) || [],
  };
}

/** Contribuições do último ano (reaproveita o serviço da cobrinha). */
export function fetchContributions(user: string): Promise<ContributionGrid> {
  return fetchGrid(user);
}

// ---------- contas ----------

/** Linguagens mais usadas: quantos repositórios (não forks) usam cada uma, em %. */
export function topLanguages(repos: Repo[], limit = 5): { name: string; share: number }[] {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (r.fork || !r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([name, n]) => ({ name, share: n / total }));
  const rest = sorted.slice(limit).reduce((a, [, n]) => a + n, 0);
  if (rest) top.push({ name: 'Other', share: rest / total });
  return top;
}

export interface Streaks {
  total: number;
  current: number;
  longest: number;
  activeDays: number;
  bestDay: { date: string; count: number };
}

/** Sequências de dias com contribuição: atual (até hoje ou ontem) e a maior do ano. */
export function streaks(grid: ContributionGrid): Streaks {
  const days = [...grid.cells].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let run = 0;
  let best = { date: '', count: 0 };
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (d.count > best.count) best = { date: d.date, count: d.count };
  }
  // sequência atual: conta de trás pra frente; hoje sem commit ainda não quebra
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i === days.length - 1) continue;
    else break;
  }
  return {
    total: grid.total,
    current,
    longest,
    activeDays: days.filter((d) => d.count > 0).length,
    bestDay: best,
  };
}

/** "há 3 dias", "2 hours ago"… */
export function ago(iso: string, pt: boolean): string {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  const units: [number, string, string][] = [[525600, 'year', 'ano'], [43200, 'month', 'mês'], [1440, 'day', 'dia'], [60, 'hour', 'hora'], [1, 'minute', 'minuto']];
  for (const [size, en, br] of units) {
    if (min >= size) {
      const n = Math.floor(min / size);
      if (pt) return `há ${n} ${n === 1 ? br : br === 'mês' ? 'meses' : `${br}s`}`;
      return `${n} ${en}${n === 1 ? '' : 's'} ago`;
    }
  }
  return pt ? 'agora' : 'now';
}

export interface Commit {
  message: string;   // só a primeira linha
  date: string;
  author: string;
  sha: string;
}

export interface RepoDetails {
  languages: { name: string; share: number }[];  // por bytes de código
  commits: Commit[];
}

/** Detalhes de um repositório pro painel: linguagens (por bytes) e últimos commits. */
export async function fetchRepoDetails(fullName: string): Promise<RepoDetails> {
  if (fullName.startsWith('demo/')) {
    return {
      languages: [{ name: 'C++', share: 0.82 }, { name: 'CMake', share: 0.1 }, { name: 'Shell', share: 0.08 }],
      commits: [
        { message: 'feat: add lighthouse fog shader', date: new Date(Date.now() - 2 * 864e5).toISOString(), author: 'demo', sha: 'a1b2c3d' },
        { message: 'fix: collision on stairs', date: new Date(Date.now() - 3 * 864e5).toISOString(), author: 'demo', sha: 'e4f5a6b' },
        { message: 'refactor: split renderer', date: new Date(Date.now() - 6 * 864e5).toISOString(), author: 'luana', sha: 'c7d8e9f' },
      ],
    };
  }
  const key = `gh:details:${fullName.toLowerCase()}`;
  const hit = cached<RepoDetails>(key);
  if (hit) return hit;
  const [langs, commits] = await Promise.all([
    gh<Record<string, number>>(`/repos/${fullName}/languages`),
    gh<{ sha: string; commit: { message: string; author: { name: string; date: string } }; author: { login: string } | null }[]>(
      `/repos/${fullName}/commits?per_page=5`,
    ).catch(() => []),
  ]);
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
  const details: RepoDetails = {
    languages: Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, bytes]) => ({ name, share: bytes / total })),
    commits: commits.map((c) => ({
      message: c.commit.message.split('\n')[0],
      date: c.commit.author.date,
      author: c.author?.login ?? c.commit.author.name,
      sha: c.sha.slice(0, 7),
    })),
  };
  store(key, details);
  return details;
}
