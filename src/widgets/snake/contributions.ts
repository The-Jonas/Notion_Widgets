// Busca as contribuições públicas de um usuário do GitHub e monta o grid
// de 7 linhas (domingo a sábado) × ~53 colunas (semanas), igual ao do perfil.

export interface Cell {
  x: number;       // coluna (semana)
  y: number;       // linha (dia da semana, 0 = domingo)
  level: number;   // 0 a 4, intensidade igual à do GitHub
  count: number;   // número de contribuições no dia
  date: string;    // AAAA-MM-DD
}

export interface ContributionGrid {
  cols: number;
  rows: number;
  cells: Cell[];
  total: number;   // soma das contribuições do período
}

interface ApiDay {
  date: string;
  count: number;
  level: number;
}

// API pública e gratuita que lê o gráfico de contribuições (sem login)
const API = 'https://github-contributions-api.jogruber.de/v4/';

/** Converte a lista de dias (em ordem) no grid de semanas × dias da semana. */
function toGrid(days: ApiDay[]): ContributionGrid {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  // a primeira coluna começa no dia da semana do primeiro dia
  const offset = sorted.length ? new Date(`${sorted[0].date}T12:00:00`).getDay() : 0;
  const cells = sorted.map((d, i) => ({
    x: Math.floor((i + offset) / 7),
    y: (i + offset) % 7,
    level: Math.max(0, Math.min(4, d.level)),
    count: d.count,
    date: d.date,
  }));
  const cols = cells.length ? cells[cells.length - 1].x + 1 : 0;
  return { cols, rows: 7, cells, total: sorted.reduce((sum, d) => sum + d.count, 0) };
}

/** Gera um ano de contribuições aleatórias (pra demonstração e testes). */
export function demoGrid(seed = 7): ContributionGrid {
  let s = seed;
  // gerador pseudoaleatório simples e determinístico
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const days: ApiDay[] = [];
  const end = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const r = rand() * (weekend ? 0.7 : 1);
    const level = r < 0.42 ? 0 : r < 0.66 ? 1 : r < 0.83 ? 2 : r < 0.94 ? 3 : 4;
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ date, level, count: level === 0 ? 0 : level * 3 + Math.floor(rand() * 3) });
  }
  return toGrid(days);
}

/** Busca o último ano de contribuições do usuário. Lança erro com mensagem amigável. */
export async function fetchGrid(user: string): Promise<ContributionGrid> {
  if (user.toLowerCase() === 'demo') return demoGrid();
  // nomes do GitHub só têm letras, números e hífens (sem "_" nem espaços)
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user)) {
    const guess = user.replace(/[^a-z\d-]+/gi, '-');
    throw new Error(`"${user}" is not a valid GitHub username (only letters, numbers and "-"). Did you mean "${guess}"?`);
  }
  let res: Response;
  try {
    res = await fetch(`${API}${encodeURIComponent(user)}?y=last`);
  } catch {
    throw new Error('Could not reach the contributions service (network blocked or offline).');
  }
  if (res.status === 404) throw new Error(`GitHub user "${user}" not found.`);
  if (!res.ok) throw new Error('Could not load contributions right now. Try again later.');
  const data = (await res.json()) as { contributions?: ApiDay[] };
  if (!data.contributions?.length) throw new Error(`No public contributions for "${user}".`);
  return toGrid(data.contributions);
}
