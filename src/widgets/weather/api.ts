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

  // sem coordenadas: descobre pela cidade (geocoding da própria Open-Meteo)
  if (lat === null || lon === null) {
    const geoKey = `weather:geo:${o.city.toLowerCase()}`;
    let geo = cached<{ lat: number; lon: number; name: string }>(geoKey);
    if (!geo) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&language=${o.lang.slice(0, 2)}&name=${encodeURIComponent(o.city)}`;
      const res = await safeFetch(url);
      const json = (await res.json()) as { results?: { latitude: number; longitude: number; name: string }[] };
      const hit = json.results?.[0];
      if (!hit) throw new Error(`City "${o.city}" not found. Try another spelling or set lat/lon.`);
      geo = { lat: hit.latitude, lon: hit.longitude, name: hit.name };
      store(geoKey, geo);
    }
    lat = geo.lat;
    lon = geo.lon;
    place = o.label || geo.name;
  }

  const unit = o.fahrenheit ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';
  const key = `weather:data:${lat.toFixed(3)},${lon.toFixed(3)}${unit}`;
  const hit = cached<Omit<WeatherData, 'place'>>(key);
  if (hit) return { ...hit, place };

  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=7${unit}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';
  const res = await safeFetch(url);
  const j = await res.json();
  const data: Omit<WeatherData, 'place'> = {
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
  return { ...data, place };
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
