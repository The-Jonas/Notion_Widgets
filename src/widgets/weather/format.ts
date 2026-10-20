// Formatação compartilhada pelos layouts do clima.
import type { WeatherData, WeatherOptions } from './api';

/** Temperatura arredondada com o símbolo de grau, ex.: "31°". */
export function deg(t: number): string {
  return `${Math.round(t)}°`;
}

/** Velocidade do vento com a unidade certa (km/h ou mph). */
export function windText(w: number, o: WeatherOptions): string {
  return `${Math.round(w)} ${o.fahrenheit ? 'mph' : 'km/h'}`;
}

/** Hora "HH:MM" de um horário AAAA-MM-DDTHH:MM. */
export function clock(iso: string): string {
  return iso.slice(11, 16);
}

/** Minutos entre dois horários locais AAAA-MM-DDTHH:MM (b - a). */
export function minutesBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

/** Duração em "5h 12m". */
export function duration(min: number): string {
  const m = Math.max(0, Math.round(min));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

/** Nível do índice UV em texto curto. */
export function uvLevel(uv: number, pt: boolean): string {
  if (uv < 3) return pt ? 'Baixo' : 'Low';
  if (uv < 6) return pt ? 'Moderado' : 'Moderate';
  if (uv < 8) return pt ? 'Alto' : 'High';
  if (uv < 11) return pt ? 'Muito alto' : 'Very high';
  return pt ? 'Extremo' : 'Extreme';
}

/** Ponto cardeal de onde o vento vem (N, NE, E...). */
export function compass(deg: number, pt: boolean): string {
  const en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const br = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  return (pt ? br : en)[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

/** Link aberto ao clicar num dia: busca do Google com a previsão daquele dia
    (cidade, estado e dia da semana) ou o mapa do Windy na região. null = sem link. */
export function dayHref(data: WeatherData, o: WeatherOptions, date: string, index: number): string | null {
  if (o.link === 'none') return null;
  if (o.link === 'windy') return `https://www.windy.com/?${data.lat.toFixed(3)},${data.lon.toFixed(3)},9`;
  const pt = o.lang === 'pt-BR';
  const when = index === 0
    ? (pt ? 'hoje' : 'today')
    : new Date(`${date}T12:00:00`).toLocaleDateString(o.lang, { weekday: 'long' });
  const query = [pt ? 'clima' : 'weather', data.place, data.region, when].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** Como o bloco de um dia reage ao clique: vira botão que abre o painel do dia,
    link externo (Google/Windy) ou fica só um bloco comum. */
export function dayAction(
  data: WeatherData,
  o: WeatherOptions,
  date: string,
  index: number,
  onpick: (index: number) => void,
): { tag: string; attrs: Record<string, unknown> } {
  if (o.link === 'panel') {
    return { tag: 'button', attrs: { type: 'button', onclick: () => onpick(index) } };
  }
  const href = dayHref(data, o, date, index);
  return href
    ? { tag: 'a', attrs: { href, target: '_blank', rel: 'noreferrer' } }
    : { tag: 'div', attrs: {} };
}
