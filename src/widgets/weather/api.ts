// Busca o clima na Open-Meteo (gratuita, sem chave de API) e converte
// os códigos de tempo da OMM em tipos de ícone e descrições.
import { getParam, getBool, getNumber } from '../../shared/params';

export type Kind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';
export type Lang = 'en-US' | 'pt-BR';

export interface DayForecast {
  date: string;        // AAAA-MM-DD
  code: number;
  max: number;
  min: number;
  rain: number;        // chance de chuva (%)
}

export interface WeatherData {
  place: string;
  region: string;      // "Estado, País" da cidade encontrada (vazio com lat/lon manuais)
  current: {
    temp: number;
    feels: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  daily: DayForecast[];
}

export interface WeatherOptions {
  city: string;
  label: string;          // nome exibido (vazio = nome da cidade)
  lat: number | null;
  lon: number | null;
  fahrenheit: boolean;
  days: number;
  lang: Lang;
  details: boolean;       // sensação, umidade e vento
  showRegion: boolean;    // mostra estado e país embaixo da cidade
  animate: boolean;       // ícones animados
}

/** Lê as opções do widget a partir da URL. */
export function readOptions(): WeatherOptions {
  const lat = getNumber('lat', NaN);
  const lon = getNumber('lon', NaN);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  return {
    city: getParam('city', 'Brasília').trim(),
    label: getParam('label', '').trim(),
    lat: hasCoords ? lat : null,
    lon: hasCoords ? lon : null,
    fahrenheit: getParam('units', 'c') === 'f',
    days: Math.min(7, Math.max(3, Math.round(getNumber('days', 7)))),
    lang: getParam('lang', 'en-US') === 'pt-BR' ? 'pt-BR' : 'en-US',
    details: getBool('details', true),
    showRegion: getBool('region', true),
    animate: getBool('animate', true),
  };
}

/** Converte um código de tempo da OMM no tipo de ícone. */
export function kindOf(code: number): Kind {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

const DESCRIPTIONS: Record<Lang, Record<Kind, string>> = {
  'en-US': {
    clear: 'Clear sky', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog',
    drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm',
  },
  'pt-BR': {
    clear: 'Céu limpo', partly: 'Parcialmente nublado', cloudy: 'Nublado', fog: 'Neblina',
    drizzle: 'Garoa', rain: 'Chuva', snow: 'Neve', storm: 'Tempestade',
  },
};

/** Descrição curta do tempo no idioma escolhido. */
export function describe(code: number, lang: Lang): string {
  if (code === 1) return lang === 'pt-BR' ? 'Poucas nuvens' : 'Mainly clear';
  return DESCRIPTIONS[lang][kindOf(code)];
}

/** Textos fixos da interface. */
export const TEXT: Record<Lang, { today: string; feels: string; humidity: string; wind: string; hi: string; lo: string }> = {
  'en-US': { today: 'Today', feels: 'Feels', humidity: 'Humidity', wind: 'Wind', hi: 'H', lo: 'L' },
  'pt-BR': { today: 'Hoje', feels: 'Sensação', humidity: 'Umidade', wind: 'Vento', hi: 'Máx', lo: 'Mín' },
};

/** Nome curto do dia da semana ("Tue", "Ter") ou "Today"/"Hoje" para o primeiro. */
export function dayName(date: string, index: number, lang: Lang): string {
  if (index === 0) return TEXT[lang].today;
  const d = new Date(`${date}T12:00:00`);
  const name = d.toLocaleDateString(lang, { weekday: 'short' }).replace('.', '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const CACHE_MS = 30 * 60 * 1000;

/** Lê do cache local uma resposta guardada há menos de 30 min. */
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

/** Dados inventados pra demonstração e testes (city=demo). */
function demoData(o: WeatherOptions): WeatherData {
  const codes = [0, 61, 2, 3, 3, 80, 95];
  const today = new Date();
  const daily = codes.map((code, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { date, code, max: [31, 27, 33, 33, 34, 29, 26][i], min: [20, 19, 20, 20, 23, 21, 18][i], rain: [0, 80, 10, 20, 15, 70, 90][i] };
  });
  return {
    place: o.label || 'Sobradinho',
    region: o.lang === 'pt-BR' ? 'Distrito Federal, Brasil' : 'Federal District, Brazil',
    current: { temp: 29, feels: 31, humidity: 42, wind: 11, code: 0, isDay: true },
    daily,
  };
}

/** Busca o clima atual e a previsão (com cache de 30 min). Lança erro amigável. */
export async function fetchWeather(o: WeatherOptions): Promise<WeatherData> {
  if (o.city.toLowerCase() === 'demo') return demoData(o);

  let lat = o.lat;
  let lon = o.lon;
  let place = o.label || o.city;
  let region = '';

  // sem coordenadas: descobre pela cidade (geocoding da própria Open-Meteo)
  if (lat === null || lon === null) {
    const geo = await geocode(o);
    lat = geo.lat;
    lon = geo.lon;
    place = o.label || geo.name;
    region = geo.region;
  }

  const unit = o.fahrenheit ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';
  const key = `weather:data:${lat.toFixed(3)},${lon.toFixed(3)}${unit}`;
  const hit = cached<Omit<WeatherData, 'place' | 'region'>>(key);
  if (hit) return { ...hit, place, region };

  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=7${unit}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';
  const res = await safeFetch(url);
  const j = await res.json();
  const data: Omit<WeatherData, 'place' | 'region'> = {
    current: {
      temp: j.current.temperature_2m,
      feels: j.current.apparent_temperature,
      humidity: j.current.relative_humidity_2m,
      wind: j.current.wind_speed_10m,
      code: j.current.weather_code,
      isDay: j.current.is_day === 1,
    },
    daily: (j.daily.time as string[]).map((date, i) => ({
      date,
      code: j.daily.weather_code[i],
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      rain: j.daily.precipitation_probability_max?.[i] ?? 0,
    })),
  };
  store(key, data);
  return { ...data, place, region };
}

// siglas dos estados brasileiros, pra aceitar "Sobradinho, DF"
const UF: Record<string, string[]> = {
  ac: ['acre'], al: ['alagoas'], ap: ['amapa'], am: ['amazonas'], ba: ['bahia'], ce: ['ceara'],
  df: ['distrito federal', 'federal district'], es: ['espirito santo'], go: ['goias'], ma: ['maranhao'],
  mt: ['mato grosso'], ms: ['mato grosso do sul'], mg: ['minas gerais'], pa: ['para'], pb: ['paraiba'],
  pr: ['parana'], pe: ['pernambuco'], pi: ['piaui'], rj: ['rio de janeiro'], rn: ['rio grande do norte'],
  rs: ['rio grande do sul'], ro: ['rondonia'], rr: ['roraima'], sc: ['santa catarina'], sp: ['sao paulo'],
  se: ['sergipe'], to: ['tocantins'],
};

/** Deixa o texto comparável: minúsculo e sem acentos. */
function norm(text: string | undefined): string {
  return (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

interface GeoHit {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
}

/** Diz se um resultado bate com um qualificador ("DF", "Bahia", "Brasil", "BR"...). */
function matches(hit: GeoHit, qualifier: string): boolean {
  const q = norm(qualifier);
  const fields = [hit.admin1, hit.admin2, hit.country, hit.country_code].map(norm);
  if (fields.some((f) => f === q || (q.length > 3 && f.includes(q)))) return true;
  // sigla de estado: compara com o nome por extenso, com e sem a parte em inglês ("State of")
  const full = UF[q];
  return !!full && full.some((name) => norm(hit.admin1).replace(/^state of /, '').startsWith(name));
}

/** "Estado, País" de um resultado do geocoding. */
function regionOf(hit: GeoHit): string {
  return [hit.admin1, hit.country].filter(Boolean).join(', ');
}

/** Acha a cidade. Aceita qualificadores depois de vírgula: "Sobradinho, DF" ou "Paris, US". */
async function geocode(o: WeatherOptions): Promise<{ lat: number; lon: number; name: string; region: string }> {
  const key = `weather:geo2:${o.lang}:${norm(o.city)}`;
  const saved = cached<{ lat: number; lon: number; name: string; region: string }>(key);
  if (saved) return saved;

  const [name, ...qualifiers] = o.city.split(',').map((part) => part.trim()).filter(Boolean);
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=10&language=${o.lang.slice(0, 2)}&name=${encodeURIComponent(name)}`;
  const res = await safeFetch(url);
  const hits = ((await res.json()) as { results?: GeoHit[] }).results ?? [];
  if (!hits.length) throw new Error(`City "${name}" not found. Try another spelling or set lat/lon.`);

  // sem qualificador fica o primeiro (o mais populoso); com qualificador, o que bater com todos
  const hit = qualifiers.length ? hits.find((h) => qualifiers.every((q) => matches(h, q))) : hits[0];
  if (!hit) {
    const options = hits.slice(0, 4).map((h) => `${h.name} (${regionOf(h)})`).join('; ');
    throw new Error(`No "${name}" in "${qualifiers.join(', ')}". Found: ${options}.`);
  }
  const geo = { lat: hit.latitude, lon: hit.longitude, name: hit.name, region: regionOf(hit) };
  store(key, geo);
  return geo;
}

/** fetch com mensagens de erro amigáveis. */
async function safeFetch(url: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Could not reach the weather service (network blocked or offline).');
  }
  if (!res.ok) throw new Error('The weather service did not answer. Try again later.');
  return res;
}
