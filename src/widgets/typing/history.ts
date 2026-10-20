// Histórico dos testes de digitação e das teclas mais erradas (no navegador).

export interface Run {
  t: number;    // quando terminou (ms)
  wpm: number;
  acc: number;  // 0 a 100
  mode: string;
}

const RUNS_KEY = 'nw-typing-runs';
const MISSES_KEY = 'nw-typing-misses';

/** Lê um JSON salvo; devolve o padrão se faltar ou der erro. */
function load<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Salva um JSON (ignora falta de armazenamento). */
function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem armazenamento */
  }
}

/** Todos os testes salvos (mais antigo primeiro). */
export function loadRuns(): Run[] {
  return load<Run[]>(RUNS_KEY, []);
}

/** Guarda um teste terminado (mantém os últimos 300). */
export function saveRun(run: Run): Run[] {
  const runs = [...loadRuns(), run].slice(-300);
  save(RUNS_KEY, runs);
  return runs;
}

/** Erros acumulados por tecla esperada. */
export function loadMisses(): Record<string, number> {
  return load<Record<string, number>>(MISSES_KEY, {});
}

/** Soma os erros deste teste aos acumulados. */
export function addMisses(add: Record<string, number>): Record<string, number> {
  const all = loadMisses();
  for (const [k, n] of Object.entries(add)) all[k] = (all[k] ?? 0) + n;
  save(MISSES_KEY, all);
  return all;
}

/** Zera histórico e erros. */
export function clearHistory(): void {
  save(RUNS_KEY, []);
  save(MISSES_KEY, {});
}
