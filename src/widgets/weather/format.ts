// Formatação compartilhada pelos layouts do clima.
import type { WeatherOptions } from './api';

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
