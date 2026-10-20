// "Cérebro" do timer: guarda o estado reativo e as ações (start, pause...).
// Todos os estilos visuais (faces) recebem esta mesma instância,
// então a lógica existe uma vez só e cada face cuida apenas do visual.
import {
  type Mode, type Phase, type TimerState, type Settings, type DayStats, type Labels,
  defaultSettings, initialState, nextPhase, phaseDuration,
  loadJSON, saveJSON, todayKey, formatClock, MINUTE, FOCUS_PRESETS,
} from './engine';
import { unlockAudio, playSound, playTick, askNotificationPermission, notify } from './alerts';
import { getNumber } from '../../shared/params';

/** Usa os ajustes salvos só se a URL do embed for a mesma de quando foram salvos;
 *  se você mudar a URL (ex.: focus=50), a URL vence. */
function loadSettings(): Settings {
  const saved = loadJSON<{ url: string | null; settings: Settings | null }>('nw-timer-settings', { url: null, settings: null });
  const base = defaultSettings();
  if (saved.url !== location.search || !saved.settings) return base;
  return { ...base, ...saved.settings, labels: { ...base.labels, ...saved.settings.labels } };
}

const LABELS = { focus: 'FOCUS', short: 'SHORT BREAK', long: 'LONG BREAK', game: 'GAME TIME', over: 'GAME OVER' };

export class TimerController {
  mode = $state<Mode>('focus');
  settings = $state<Settings>(loadSettings());
  timer = $state<TimerState>() as TimerState;
  task = $state(loadJSON('nw-timer-task', { text: '' }).text);
  stats = $state<DayStats>(loadJSON('nw-timer-stats', { date: todayKey(), sessions: 0, minutes: 0 }));
  settingsOpen = $state(false);
  now = $state(Date.now());

  private lastTickSecond = -1;

  /** Tempo restante em ms (conta a partir do relógio quando está rodando). */
  remaining = $derived(this.timer.running ? Math.max(0, this.timer.endsAt - this.now) : this.timer.remaining);
  /** Fração já percorrida da fase (0 a 1). */
  progress = $derived(this.timer.duration > 0 ? 1 - this.remaining / this.timer.duration : 0);
  /** Tempo restante formatado (MM:SS). */
  clock = $derived(formatClock(this.remaining));
  /** Nome da fase atual: texto personalizado se houver, senão o padrão. */
  label = $derived(this.labelFor(this.timer.finished ? 'over' : this.timer.phase, LABELS));
  /** Linha de apoio embaixo do tempo (round, minutos resgatados...). */
  subtitle = $derived(
    this.timer.finished
      ? this.settings.labels.overSub || 'back to quests ⚔️'
      : this.mode === 'focus'
        ? `round ${this.timer.round} / ${this.settings.rounds}`
        : `${this.timer.gameMinutes} min redeemed`,
  );
  /** Rótulo do preset de foco em uso (ex.: "50/10") ou "custom". */
  activePreset = $derived(
    FOCUS_PRESETS.find((p) => p.focus === this.settings.focus && p.short === this.settings.short)?.label ?? 'custom',
  );

  /** Devolve o texto de uma fase: o personalizado (se preenchido) ou o padrão
   *  do estilo. Cada estilo pode passar seus próprios padrões (ex.: o retro). */
  labelFor(key: keyof Labels & keyof typeof LABELS, defaults: Record<string, string>): string {
    const custom = this.settings.labels[key]?.trim();
    return custom || defaults[key];
  }

  /** Cria o controlador no modo pedido, restaurando o que estiver salvo. */
  constructor(startMode: Mode) {
    this.mode = startMode;
    this.timer = this.loadMode(startMode);
    if (this.stats.date !== todayKey()) this.stats = { date: todayKey(), sessions: 0, minutes: 0 };
  }

  /** Carrega o estado salvo de um modo, ou cria um novo. Assim como os ajustes,
   *  o estado só é reaproveitado se a URL do embed for a mesma (mudou a URL = começa do zero). */
  private loadMode(mode: Mode): TimerState {
    const fresh = initialState(mode, this.settings, getNumber('game', 60));
    const saved = loadJSON<{ url: string | null; state: TimerState | null }>(`nw-timer-${mode}`, { url: null, state: null });
    return saved.url === location.search && saved.state ? saved.state : fresh;
  }

  /** Salva tudo no navegador (chamado por um $effect no componente). */
  persist(): void {
    saveJSON(`nw-timer-${this.mode}`, { url: location.search, state: $state.snapshot(this.timer) });
    saveJSON('nw-timer-settings', { url: location.search, settings: $state.snapshot(this.settings) });
    saveJSON('nw-timer-task', { text: this.task });
    saveJSON('nw-timer-stats', $state.snapshot(this.stats));
  }

  /** Avança o relógio interno: detecta fim de fase e toca o tique-taque. */
  tick(now: number): void {
    this.now = now;
    if (!this.timer.running) return;
    if (now >= this.timer.endsAt) {
      this.finishPhase();
      return;
    }
    const second = Math.floor(this.remaining / 1000);
    if (this.settings.tick && this.timer.phase === 'focus' && second !== this.lastTickSecond) {
      this.lastTickSecond = second;
      playTick(this.settings.volume);
    }
  }

  /** Inicia ou retoma a contagem a partir do tempo restante. */
  start(): void {
    unlockAudio();
    askNotificationPermission();
    if (this.timer.remaining <= 0) return;
    this.timer.endsAt = Date.now() + this.timer.remaining;
    this.timer.running = true;
    this.timer.finished = false;
  }

  /** Pausa guardando quanto tempo ainda falta. */
  pause(): void {
    this.timer.remaining = Math.max(0, this.timer.endsAt - Date.now());
    this.timer.running = false;
  }

  /** Alterna entre iniciar e pausar (botão principal). */
  toggle(): void {
    if (this.timer.running) this.pause();
    else this.start();
  }

  /** Reinicia a fase atual pro tempo cheio. Se ela já estiver cheia e parada,
   *  um segundo clique reinicia o ciclo inteiro (round 1, foco). */
  reset(): void {
    const full = phaseDuration(this.timer.phase, this.settings, this.timer.gameMinutes);
    const alreadyFull = !this.timer.running && this.timer.remaining === full;
    const midCycle = this.timer.phase !== 'focus' || this.timer.round !== 1;
    if (this.mode === 'focus' && alreadyFull && midCycle) {
      this.restartCycle();
      return;
    }
    this.timer = { ...this.timer, running: false, remaining: full, duration: full, finished: false };
  }

  /** Pula direto pra uma fase escolhida nas abas (Focus / Short / Long), parada. */
  setPhase(phase: Phase): void {
    if (phase === this.timer.phase && !this.timer.running) return;
    const duration = phaseDuration(phase, this.settings, this.timer.gameMinutes);
    this.timer = { ...this.timer, phase, running: false, remaining: duration, duration, finished: false };
  }

  /** Volta o pomodoro pro começo: round 1, fase de foco, parado. */
  restartCycle(): void {
    const duration = phaseDuration('focus', this.settings, this.timer.gameMinutes);
    this.timer = { ...this.timer, phase: 'focus', round: 1, running: false, remaining: duration, duration, finished: false };
  }

  /** Chamado quando um ajuste de tempo/rounds muda no painel ⚙. Se o timer
   *  estiver parado, aplica na hora; mudar os rounds reinicia o ciclo, porque
   *  o round atual e a pausa longa dependem desse número. */
  settingsChanged(field: 'time' | 'rounds'): void {
    if (this.timer.running) return;
    if (field === 'rounds') {
      this.settings.rounds = Math.min(12, Math.max(1, Math.round(this.settings.rounds || 1)));
      this.restartCycle();
    } else {
      const duration = phaseDuration(this.timer.phase, this.settings, this.timer.gameMinutes);
      this.timer = { ...this.timer, remaining: duration, duration, finished: false };
    }
  }

  /** Pula pra próxima fase do pomodoro (não conta como foco completo). */
  skip(): void {
    this.timer = nextPhase(this.timer, this.settings);
  }

  /** Chamado quando o tempo zera: registra, avisa e prepara a próxima fase. */
  private finishPhase(): void {
    const { volume, sound } = this.settings;
    if (this.timer.phase === 'game') {
      this.timer = { ...this.timer, running: false, remaining: 0, finished: true };
      playSound(sound, volume, true);
      notify('GAME OVER', 'Time is up. Back to your quests ⚔️');
      return;
    }
    const wasFocus = this.timer.phase === 'focus';
    if (wasFocus) this.addFocusToStats(this.timer.duration / MINUTE);
    this.timer = nextPhase(this.timer, this.settings);
    playSound(sound, volume);
    notify(wasFocus ? 'Focus done 🎯' : 'Break over ☕', wasFocus ? 'Take a break.' : 'Back to focus.');
    if (this.settings.auto) this.start();
  }

  /** Soma um foco completo na estatística de hoje. */
  private addFocusToStats(minutes: number): void {
    if (this.stats.date !== todayKey()) this.stats = { date: todayKey(), sessions: 0, minutes: 0 };
    this.stats.sessions += 1;
    this.stats.minutes += minutes;
  }

  /** Troca entre FOCUS e GAME, mantendo o estado salvo de cada um. */
  switchMode(next: Mode): void {
    if (next === this.mode) return;
    this.persist();
    this.mode = next;
    this.timer = this.loadMode(next);
  }

  /** Aplica um preset de ciclo (25/5, 50/10...) e reinicia a fase se estiver parado. */
  applyPreset(focus: number, short: number, long: number): void {
    this.settings.focus = focus;
    this.settings.short = short;
    this.settings.long = long;
    if (!this.timer.running) this.reset();
  }

  /** Muda o tempo do modo game (só quando está parado), entre 1 e 600 min. */
  setGameMinutes(minutes: number): void {
    if (this.timer.running) return;
    const m = Math.min(600, Math.max(1, minutes));
    const duration = m * MINUTE;
    this.timer = { ...this.timer, gameMinutes: m, duration, remaining: duration, finished: false };
  }

  /** Toca o som escolhido uma vez (botão de teste nos ajustes). */
  previewSound(): void {
    unlockAudio();
    playSound(this.settings.sound, this.settings.volume);
  }
}
