// Opções do widget de progresso (lidas da URL) e o cálculo de quanto
// já passou do dia, semana, mês, ano e de um período personalizado.
import { getParam, getBool, getNumber } from '../../shared/params';

export type PeriodKey = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface ProgressOptions {
  periods: PeriodKey[];   // períodos visíveis, na ordem
  weekStart: 0 | 1;       // 0 = domingo, 1 = segunda
  decimals: number;       // casas decimais da porcentagem
  detail: boolean;        // mostra a linha extra (dia 20 de 31, faltam 5h…)
  multicolor: boolean;    // cada período com uma cor do Notion
  lang: 'en-US' | 'pt-BR';
  labels: Record<PeriodKey, string>;
  customStart: Date | null;
  customEnd: Date | null;
}

export interface PeriodItem {
  key: PeriodKey;
  label: string;
  progress: number;       // de 0 a 1
  percent: string;        // já formatado, ex.: "65%"
  detail: string;         // ex.: "Day 20 of 31"
  color: string;          // cor CSS usada no preenchimento
}

// cores fixas do modo multicolor (paleta do Notion)
const PERIOD_COLORS: Record<PeriodKey, string> = {
  day: '#529cca',
  week: '#9a6dd7',
  month: '#4dab9a',
  year: '#ffa344',
  custom: '#e255a1',
};

// textos padrão por idioma
const TEXTS = {
  'en-US': {
    labels: { day: 'Day', week: 'Week', month: 'Month', year: 'Year', custom: 'Semester' },
    left: (s: string) => `${s} left`,
    of: (a: number, b: number, unit: string) => `${unit} ${a} of ${b}`,
    day: 'Day',
    daysLeft: (n: number) => (n === 1 ? '1 day left' : `${n} days left`),
    notStarted: (n: number) => (n === 1 ? 'starts in 1 day' : `starts in ${n} days`),
    done: 'Done',
  },
  'pt-BR': {
    labels: { day: 'Dia', week: 'Semana', month: 'Mês', year: 'Ano', custom: 'Semestre' },
    left: (s: string) => `faltam ${s}`,
    of: (a: number, b: number, unit: string) => `${unit} ${a} de ${b}`,
    day: 'Dia',
    daysLeft: (n: number) => (n === 1 ? 'falta 1 dia' : `faltam ${n} dias`),
    notStarted: (n: number) => (n === 1 ? 'começa em 1 dia' : `começa em ${n} dias`),
    done: 'Concluído',
  },
};

const DAY_MS = 86_400_000;

/** Converte "AAAA-MM-DD" numa data local à meia-noite (ou null se inválida). */
function parseDay(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Lê todas as opções do widget a partir da URL. */
export function readOptions(): ProgressOptions {
  const lang = getParam('lang', 'en-US') === 'pt-BR' ? 'pt-BR' : 'en-US';
  const defaults = TEXTS[lang].labels;
  const customStart = parseDay(getParam('start', ''));
  const customEnd = parseDay(getParam('end', ''));

  const periods: PeriodKey[] = [];
  if (getBool('day', true)) periods.push('day');
  if (getBool('week', true)) periods.push('week');
  if (getBool('month', true)) periods.push('month');
  if (getBool('year', true)) periods.push('year');
  if (customStart && customEnd && customEnd >= customStart) periods.push('custom');

  const label = (key: PeriodKey) => getParam(`label_${key}`, '').trim() || defaults[key];

  return {
    periods,
    weekStart: getParam('weekstart', 'monday') === 'sunday' ? 0 : 1,
    decimals: Math.min(2, Math.max(0, Math.round(getNumber('decimals', 0)))),
    detail: getBool('detail', true),
    multicolor: getParam('colors', 'single') === 'multi',
    lang,
    labels: {
      day: label('day'), week: label('week'), month: label('month'),
      year: label('year'), custom: label('custom'),
    },
    customStart,
    customEnd,
  };
}

/** Devolve o início e o fim (exclusivo) do período que contém "now". */
function bounds(key: PeriodKey, now: Date, o: ProgressOptions): [Date, Date] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  switch (key) {
    case 'day':
      return [new Date(y, m, d), new Date(y, m, d + 1)];
    case 'week': {
      const back = (now.getDay() - o.weekStart + 7) % 7;
      return [new Date(y, m, d - back), new Date(y, m, d - back + 7)];
    }
    case 'month':
      return [new Date(y, m, 1), new Date(y, m + 1, 1)];
    case 'year':
      return [new Date(y, 0, 1), new Date(y + 1, 0, 1)];
    case 'custom': {
      // o dia final conta inteiro: termina na meia-noite seguinte
      const s = o.customStart!;
      const e = o.customEnd!;
      return [s, new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)];
    }
  }
}

/** Formata a porcentagem sem arredondar pra cima (100% só no fim de verdade). */
function formatPercent(progress: number, decimals: number): string {
  const factor = 10 ** decimals;
  const value = Math.floor(progress * 100 * factor) / factor;
  return `${value.toFixed(decimals)}%`;
}

/** Formata uma duração curta em "5h 12m" ou "12m". */
function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return h > 0 ? `${h}h ${String(min).padStart(2, '0')}m` : `${min}m`;
}

/** Monta o texto da linha de detalhe de cada período. */
function detailFor(key: PeriodKey, now: Date, start: Date, end: Date, o: ProgressOptions): string {
  const t = TEXTS[o.lang];
  const dayIndex = Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  switch (key) {
    case 'day':
      return t.left(formatDuration(end.getTime() - now.getTime()));
    case 'week':
    case 'month':
    case 'year':
      return t.of(dayIndex, totalDays, t.day);
    case 'custom':
      if (now < start) return t.notStarted(Math.ceil((start.getTime() - now.getTime()) / DAY_MS));
      if (now >= end) return t.done;
      return t.daysLeft(Math.ceil((end.getTime() - now.getTime()) / DAY_MS));
  }
}

/** Calcula todos os períodos visíveis pro instante "now". */
export function computePeriods(now: Date, o: ProgressOptions): PeriodItem[] {
  return o.periods.map((key) => {
    const [start, end] = bounds(key, now, o);
    const raw = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
    const progress = Math.min(1, Math.max(0, raw));
    return {
      key,
      label: o.labels[key],
      progress,
      percent: formatPercent(progress, o.decimals),
      detail: detailFor(key, now, start, end, o),
      color: o.multicolor ? PERIOD_COLORS[key] : 'var(--accent)',
    };
  });
}
