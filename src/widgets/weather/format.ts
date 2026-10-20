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
