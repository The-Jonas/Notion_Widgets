// Sons (Web Audio, sem arquivos externos) e notificações do navegador.
import type { SoundKind } from './engine';

let ctx: AudioContext | null = null;

/** Libera o áudio; precisa ser chamado num clique (regra de autoplay dos navegadores). */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Toca uma nota com envelope (ataque rápido, decaimento até sumir). */
function tone(freq: number, start: number, length: number, type: OscillatorType, peak: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

// cada som: lista de [frequência, atraso, duração], tipo de onda e volume relativo
const SOUNDS: Record<Exclude<SoundKind, 'none'>, { notes: [number, number, number][]; type: OscillatorType; gain: number }> = {
  chime: { notes: [[523.25, 0, 0.6], [659.25, 0.18, 0.6], [783.99, 0.36, 0.8]], type: 'sine', gain: 0.35 },
  bell: { notes: [[880, 0, 1.6], [1318.5, 0.02, 1.2], [880, 0.8, 1.6]], type: 'triangle', gain: 0.3 },
  digital: { notes: [[1000, 0, 0.09], [1000, 0.15, 0.09], [1000, 0.3, 0.09], [1000, 0.45, 0.09]], type: 'square', gain: 0.12 },
  soft: { notes: [[440, 0, 1.0], [329.63, 0.35, 1.3]], type: 'sine', gain: 0.3 },
};

/** Toca o som de fim de fase; no game over a sequência é tocada de trás pra frente. */
export function playSound(kind: SoundKind, volume: number, reverse = false): void {
  if (!ctx || kind === 'none') return;
  const sound = SOUNDS[kind];
  const notes = reverse ? [...sound.notes].reverse().map(([f], i) => [f, i * 0.2, 0.7] as const) : sound.notes;
  const t0 = ctx.currentTime;
  for (const [f, delay, len] of notes) tone(f, t0 + delay, len, sound.type, sound.gain * volume);
}

/** Toca um "tique" curtinho (usado a cada segundo durante o foco). */
export function playTick(volume: number): void {
  if (!ctx) return;
  tone(1800, ctx.currentTime, 0.03, 'square', 0.03 * volume);
}

/** Pede permissão de notificação (só pergunta uma vez). */
export function askNotificationPermission(): void {
  try {
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
  } catch {
    /* dentro de alguns iframes a API não existe: segue só com som */
  }
}

/** Mostra uma notificação do sistema, se permitido. */
export function notify(title: string, body: string): void {
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
  } catch {
    /* ignora: o som já avisou */
  }
}
