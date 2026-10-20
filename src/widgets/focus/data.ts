// Contas do mapa de foco: dias do período, níveis de cor, sequência e totais.
import { type FocusLog, dayKey } from '../../shared/focusLog';

export interface Cell {
  date: string;   // AAAA-MM-DD
  minutes: number;
  sessions: number;
  level: number;  // 0 a 4
  col: number;    // semana (coluna)
  row: number;    // dia da semana (0 = segunda)
  future: boolean;
}

/** Nível de cor do dia em relação à meta diária (0 = nada, 4 = bateu a meta). */
export function levelFor(minutes: number, goal: number): number {
  if (minutes <= 0) return 0;
  const r = minutes / Math.max(1, goal);
  return r >= 1 ? 4 : r >= 0.5 ? 3 : r >= 0.25 ? 2 : 1;
}

/** Monta a grade das últimas `weeks` semanas, semanas começando na segunda. */
export function buildGrid(log: FocusLog, weeks: number, goal: number): Cell[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // 0 = segunda
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (weeks - 1) * 7);
  const cells: Cell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    const entry = log[key] ?? { m: 0, s: 0 };
    cells.push({
      date: key,
      minutes: entry.m,
      sessions: entry.s,
      level: levelFor(entry.m, goal),
      col: Math.floor(i / 7),
      row: i % 7,
      future: d > today,
    });
  }
  return cells;
}

/** Os últimos `n` dias (do mais antigo pro de hoje). */
export function lastDays(log: FocusLog, n: number): { date: string; minutes: number }[] {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ date: key, minutes: log[key]?.m ?? 0 });
  }
  return out;
}

export interface FocusStats {
  today: number;      // minutos hoje
  week: number;       // minutos nos últimos 7 dias
  total: number;      // minutos no período mostrado
  streak: number;     // dias seguidos com foco (hoje sem foco ainda não quebra)
  best: { date: string; minutes: number };
  activeDays: number;
}

/** Totais e sequência a partir do histórico. */
export function focusStats(log: FocusLog, cells: Cell[]): FocusStats {
  const today = dayKey();
  let streak = 0;
  for (let i = 0; i < 3660; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const m = log[dayKey(d)]?.m ?? 0;
    if (m > 0) streak++;
    else if (i === 0) continue;
    else break;
  }
  const past = cells.filter((c) => !c.future);
  const best = past.reduce((b, c) => (c.minutes > b.minutes ? { date: c.date, minutes: c.minutes } : b), { date: '', minutes: 0 });
  return {
    today: log[today]?.m ?? 0,
    week: lastDays(log, 7).reduce((a, d) => a + d.minutes, 0),
    total: past.reduce((a, c) => a + c.minutes, 0),
    streak,
    best,
    activeDays: past.filter((c) => c.minutes > 0).length,
  };
}

/** "1h 25m", "40m", "0m". */
export function hm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

/** Histórico falso pra pré-visualizar (demo=1). */
export function demoLog(): FocusLog {
  const log: FocusLog = {};
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 370; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const weekend = [0, 6].includes(d.getDay());
    const r = rand();
    if (r < (weekend ? 0.55 : 0.2)) continue;
    const s = 1 + Math.floor(rand() * (weekend ? 2 : 5));
    log[dayKey(d)] = { m: s * 25, s };
  }
  return log;
}
