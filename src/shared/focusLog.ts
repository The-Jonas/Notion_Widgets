// Histórico de foco por dia, compartilhado entre o timer (que escreve)
// e o mapa de foco (que lê). Fica no navegador, como o resto dos widgets.
//
// Formato: { "2026-10-20": { m: 75, s: 3 }, ... }  (m = minutos, s = sessões)

export interface FocusDay {
  m: number;
  s: number;
}

export type FocusLog = Record<string, FocusDay>;

export const FOCUS_LOG_KEY = 'nw-focus-log';
const TODAY_STATS_KEY = 'nw-timer-stats'; // estatística "de hoje" que o timer já guardava

/** Data local no formato AAAA-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Lê o histórico salvo (vazio se não houver ou der erro). */
export function readFocusLog(): FocusLog {
  let log: FocusLog = {};
  try {
    log = JSON.parse(localStorage.getItem(FOCUS_LOG_KEY) ?? '{}') as FocusLog;
  } catch {
    log = {};
  }
  // migração: dias contados antes do histórico existir só estavam no "de hoje"
  try {
    const today = JSON.parse(localStorage.getItem(TODAY_STATS_KEY) ?? 'null') as
      | { date: string; sessions: number; minutes: number }
      | null;
    if (today && today.minutes > 0 && !log[today.date]) {
      log[today.date] = { m: Math.round(today.minutes), s: today.sessions };
    }
  } catch {
    /* ignora */
  }
  return log;
}

/** Soma um foco terminado no dia de hoje. */
export function addFocus(minutes: number): void {
  const log = readFocusLog();
  const key = dayKey();
  const day = log[key] ?? { m: 0, s: 0 };
  log[key] = { m: Math.round(day.m + minutes), s: day.s + 1 };
  try {
    localStorage.setItem(FOCUS_LOG_KEY, JSON.stringify(log));
  } catch {
    /* sem armazenamento: só não guarda o histórico */
  }
}
