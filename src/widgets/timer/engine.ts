// Lógica pura do timer (sem interface).
// O tempo é guardado como "horário de término" (endsAt) e não como contador:
// assim, se o Notion recarregar ou a aba dormir, o tempo continua certo.
import { getNumber, getBool, getParam } from '../../shared/params';

export type Mode = 'focus' | 'game';
export type Phase = 'focus' | 'short' | 'long' | 'game';
export type SoundKind = 'chime' | 'bell' | 'digital' | 'soft' | 'none';

/** Textos personalizáveis de cada fase. Vazio = usa o texto padrão do estilo. */
export interface Labels {
  focus: string;
  short: string;
  long: string;
  game: string;
  over: string;    // título do game over
  overSub: string; // linha embaixo do game over
}

/** Lê os textos da URL (ex.: ?label_focus=ESTUDANDO). Vazio = padrão do estilo. */
export function defaultLabels(): Labels {
  return {
    focus: getParam('label_focus', ''),
    short: getParam('label_short', ''),
    long: getParam('label_long', ''),
    game: getParam('label_game', ''),
    over: getParam('label_over', ''),
    overSub: getParam('label_oversub', ''),
  };
}

/** Ajustes que o usuário pode mudar dentro do widget (salvos no navegador). */
export interface Settings {
  focus: number;    // minutos de foco
  short: number;    // pausa curta
  long: number;     // pausa longa
  rounds: number;   // focos até a pausa longa
  auto: boolean;    // começa a próxima fase sozinho
  sound: SoundKind; // som de fim de fase
  volume: number;   // 0 a 1
  tick: boolean;    // tique-taque durante o foco
  labels: Labels;   // textos personalizados
}

export interface TimerState {
  phase: Phase;
  round: number;       // foco atual (1..rounds)
  running: boolean;
  endsAt: number;      // timestamp de término (válido quando running)
  remaining: number;   // ms restantes (válido quando pausado)
  duration: number;    // ms totais da fase atual
  gameMinutes: number; // tempo escolhido no modo game
  finished: boolean;   // o modo game chegou ao fim
}

/** Estatística do dia: quantos focos completos e quantos minutos focados. */
export interface DayStats {
  date: string;
  sessions: number;
  minutes: number;
}

export const MINUTE = 60_000;

/** Presets de ciclo mostrados no modo Focus (foco / pausa curta / pausa longa). */
export const FOCUS_PRESETS = [
  { label: '25/5', focus: 25, short: 5, long: 15 },
  { label: '50/10', focus: 50, short: 10, long: 30 },
  { label: '90/20', focus: 90, short: 20, long: 40 },
];

/** Atalhos de tempo do modo Game, em minutos. */
export const GAME_PRESETS = [30, 60, 90, 120];

/** Lê os ajustes padrão a partir da URL (o que estiver salvo no navegador vence). */
export function defaultSettings(): Settings {
  return {
    focus: getNumber('focus', 25),
    short: getNumber('short', 5),
    long: getNumber('long', 15),
    rounds: getNumber('rounds', 4),
    auto: getBool('auto', false),
    sound: getParam('sound', 'chime') as SoundKind,
    volume: getNumber('volume', 0.6),
    tick: getBool('tick', false),
    labels: defaultLabels(),
  };
}

/** Devolve a duração em ms de uma fase. */
export function phaseDuration(phase: Phase, s: Settings, gameMinutes: number): number {
  const minutes = { focus: s.focus, short: s.short, long: s.long, game: gameMinutes }[phase];
  return minutes * MINUTE;
}

/** Cria o estado inicial de um modo, parado e com o tempo cheio. */
export function initialState(mode: Mode, s: Settings, gameMinutes: number): TimerState {
  const phase: Phase = mode === 'game' ? 'game' : 'focus';
  const duration = phaseDuration(phase, s, gameMinutes);
  return { phase, round: 1, running: false, endsAt: 0, remaining: duration, duration, gameMinutes, finished: false };
}

/** Calcula a próxima fase do pomodoro (foco → pausa → foco...), parada. */
export function nextPhase(state: TimerState, s: Settings): TimerState {
  let phase: Phase;
  let round = state.round;
  if (state.phase === 'focus') {
    phase = state.round >= s.rounds ? 'long' : 'short';
  } else {
    phase = 'focus';
    round = state.phase === 'long' ? 1 : state.round + 1;
  }
  const duration = phaseDuration(phase, s, state.gameMinutes);
  return { ...state, phase, round, running: false, endsAt: 0, remaining: duration, duration, finished: false };
}

/** Data de hoje no formato AAAA-MM-DD (fuso local). */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Lê um JSON salvo no navegador; devolve o padrão se não existir ou der erro. */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

/** Salva um JSON no navegador (falha em silêncio se o storage estiver bloqueado). */
export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* modo anônimo ou storage bloqueado: só não sobrevive ao reload */
  }
}

/** Formata ms como MM:SS (ou H:MM:SS a partir de 1 hora). */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** Formata minutos como "1h40" ou "35m". */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}m`;
}
