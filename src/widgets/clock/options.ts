// Opções do relógio lidas da URL + funções de formatação compartilhadas
// entre todos os mostradores (faces).
import { getParam, getBool } from '../../shared/params';

export interface ClockOptions {
  hour12: boolean;
  showSeconds: boolean;
  showDate: boolean;
  sweep: boolean;
  numerals: boolean;
  digits: boolean;
  lang: string;
}

/** Lê todas as opções do relógio a partir da URL. */
export function readOptions(): ClockOptions {
  return {
    hour12: getParam('format', '24') === '12',
    showSeconds: getBool('seconds', true),
    showDate: getBool('date', true),
    sweep: getBool('sweep', true),
    numerals: getBool('numerals', false),
    digits: getBool('digits', false),
    lang: getParam('lang', 'en-US'),
  };
}

/** Formata a hora (HH:MM ou HH:MM:SS) no padrão 12h/24h escolhido. */
export function formatTime(d: Date, o: ClockOptions, withSeconds = false): string {
  return d.toLocaleTimeString(o.lang, {
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: o.hour12,
  });
}

/** Formata a data por extenso, ex.: "Tuesday, October 20". */
export function formatLongDate(d: Date, o: ClockOptions): string {
  return d.toLocaleDateString(o.lang, { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Formata a data curta, ex.: "TUE 20". */
export function formatShortDate(d: Date, o: ClockOptions): string {
  const weekday = d.toLocaleDateString(o.lang, { weekday: 'short' }).replace('.', '');
  return `${weekday} ${d.getDate()}`;
}

/** Devolve horas, minutos e segundos com frações (pra ponteiros e anéis contínuos). */
export function timeParts(d: Date, sweep: boolean) {
  const seconds = d.getSeconds() + (sweep ? d.getMilliseconds() / 1000 : 0);
  const minutes = d.getMinutes() + seconds / 60;
  const hours = (d.getHours() % 12) + minutes / 60;
  return { seconds, minutes, hours };
}

/** Devolve hora e minuto como texto de 2 dígitos, respeitando 12h/24h. */
export function hourMinute(d: Date, o: ClockOptions): { hh: string; mm: string } {
  let h = d.getHours();
  if (o.hour12) h = h % 12 || 12;
  return { hh: String(h).padStart(2, '0'), mm: String(d.getMinutes()).padStart(2, '0') };
}
