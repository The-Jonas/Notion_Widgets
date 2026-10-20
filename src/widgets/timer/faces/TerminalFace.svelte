<!-- Estilo "terminal": o pomodoro como um programa rodando no terminal.
     Fases viram flags (--focus, --short, --long), o progresso é uma barra ASCII
     e os botões são comandos. Combina com a área dev e com o clima "terminal". -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import { formatMinutes } from '../engine';
  import type { Phase } from '../engine';
  import Presets from '../parts/Presets.svelte';

  let { t }: { t: TimerController } = $props();

  const WIDTH = 26;
  const PHASES: Phase[] = ['focus', 'short', 'long'];
  const TITLES = { focus: 'focus', short: 'short break', long: 'long break', game: 'game time', over: 'game over' };

  // barra ASCII: █ já passou, ░ falta
  const filled = $derived(Math.round(t.progress * WIDTH));
  const bar = $derived('█'.repeat(filled) + '░'.repeat(WIDTH - filled));
  const percent = $derived(Math.floor(t.progress * 100));
  // minutos da fase atual, pra montar o "comando"
  const minutes = $derived(Math.round(t.timer.duration / 60000));
  const command = $derived(
    t.mode === 'game'
      ? `play --time ${minutes}m`
      : `pomodoro --${t.timer.phase} ${minutes}m --rounds ${t.settings.rounds}`,
  );
  const status = $derived(t.timer.finished ? 'done' : t.timer.running ? 'running' : 'paused');
</script>

<div class="term">
  <div class="bar"><i></i><i></i><i></i><span>~/pomodoro</span></div>
  <div class="body">
    <div class="line"><span class="user">you@notion</span>:<span class="path">~</span>$ {command}</div>

    <div class="flags">
      {#if t.allowGame}
        <button class:on={t.mode === 'focus'} onclick={() => t.switchMode('focus')}>--mode=focus</button>
        <button class:on={t.mode === 'game'} onclick={() => t.switchMode('game')}>--mode=game</button>
        <span class="sep">│</span>
      {/if}
      {#if t.mode === 'focus'}
        {#each PHASES as ph (ph)}
          <button class:on={t.timer.phase === ph} onclick={() => t.setPhase(ph)}>--{ph}</button>
        {/each}
      {/if}
    </div>

    <div class="clockrow">
      <span class="clock" class:blink={!t.timer.running && !t.timer.finished && t.progress > 0}>{t.clock}</span>
      <div class="meta">
        <span class="phase">● {t.labelFor(t.timer.finished ? 'over' : t.timer.phase, TITLES)}</span>
        <span class="dim">[{status}]</span>
        <span class="dim">{t.subtitle}</span>
      </div>
    </div>

    <div class="progress"><span class="ascii">[{bar}]</span> <span class="pct">{percent}%</span></div>

    {#if t.mode === 'focus'}
      <label class="line task">
        <span class="gt">&gt;</span> task:
        <input bind:value={t.task} placeholder="what are you building?" maxlength="60" spellcheck="false" />
      </label>
    {/if}

    <div class="cmds">
      <button class="cmd main" onclick={() => t.toggle()} disabled={t.timer.finished}>{t.timer.running ? './pause' : './start'}</button>
      <button class="cmd" onclick={() => t.reset()}>./reset</button>
      {#if t.mode === 'focus'}<button class="cmd" onclick={() => t.skip()}>./skip</button>{/if}
      {#if t.mode === 'focus'}
        <span class="today">🍅 {t.stats.sessions} · {formatMinutes(t.stats.minutes)} today</span>
      {/if}
    </div>

    <div class="presets"><Presets {t} /></div>
  </div>
</div>

<style>
  .term {
    --fg: #c9d1d9; --dim: #8b949e; --line: #262c36;
    width: 100%; max-width: 520px; border-radius: 10px; overflow: hidden;
    background: #0d1117; border: 1px solid var(--line); color: var(--fg);
    font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.5;
  }
  .bar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #161b22; border-bottom: 1px solid var(--line); }
  .bar i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
  .bar i:nth-child(2) { background: #febc2e; }
  .bar i:nth-child(3) { background: #28c840; }
  .bar span { margin-left: 8px; font-size: 11px; color: var(--dim); }
  .body { padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 6px; }
  .user { color: #7ee787; }
  .path { color: #79c0ff; }
  .dim { color: var(--dim); }

  button { all: unset; cursor: pointer; font: inherit; }
  .flags { display: flex; flex-wrap: wrap; gap: 4px 10px; color: var(--dim); }
  .flags button:hover { color: var(--fg); }
  .flags button.on { color: #e6edf3; text-decoration: underline; text-underline-offset: 3px; }
  .sep { color: var(--line); }

  .clockrow { display: flex; align-items: center; gap: 16px; margin-top: 2px; }
  .clock { font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; color: #e6edf3; font-variant-numeric: tabular-nums; }
  .blink { animation: blink 1.1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0.35; } }
  .meta { display: flex; flex-direction: column; font-size: 11px; }
  .phase { color: var(--phase); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

  .progress { white-space: nowrap; overflow: hidden; }
  .ascii { color: var(--phase); letter-spacing: -0.5px; }
  .pct { color: var(--dim); }

  .task { display: flex; align-items: center; gap: 6px; color: var(--dim); }
  .gt { color: #7ee787; }
  .task input {
    all: unset; flex: 1; min-width: 0; color: var(--fg); font: inherit;
    border-bottom: 1px dashed var(--line); caret-color: #7ee787;
  }
  .task input::placeholder { color: #484f58; }

  .cmds { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .cmd { padding: 2px 8px; border: 1px solid var(--line); border-radius: 6px; color: var(--fg); }
  .cmd:hover { border-color: var(--dim); }
  .cmd.main { background: var(--phase); border-color: var(--phase); color: #0d1117; font-weight: 700; }
  .cmd:disabled { opacity: 0.4; cursor: default; }
  .today { margin-left: auto; color: var(--dim); font-size: 11px; }

  /* presets no visual do terminal */
  .presets :global(.presets) { justify-content: flex-start; }
  .presets :global(button) { font-family: inherit !important; border-radius: 6px !important; }
</style>
