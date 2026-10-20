<!-- Estilo "retro": visual de RPG em pixel art, combinando com o template.
     O tempo vira uma barra de HP em blocos e os rounds viram corações. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';

  let { t }: { t: TimerController } = $props();

  const BLOCKS = 20;
  const TITLES = {
    focus: '⚔ QUEST IN PROGRESS',
    short: '☕ REST AT THE INN',
    long: '🏕 CAMP REST',
    game: '🎮 FREE PLAY',
    over: '☠ GAME OVER',
  };

  // quantos blocos da barra ainda estão "vivos" (o tempo restante)
  const alive = $derived(Math.ceil((1 - t.progress) * BLOCKS));
  // corações = rounds do ciclo até a pausa longa:
  // ♥ concluído · ♥ pulsando = round atual · ♡ ainda por fazer
  const done = $derived(t.timer.round - (t.timer.phase === 'focus' ? 1 : 0));
  const hearts = $derived(
    Array.from({ length: t.settings.rounds }, (_, i) =>
      i < done ? 'full' : i === done && t.timer.phase === 'focus' ? 'current' : 'empty',
    ),
  );
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
</svelte:head>

<div class="retro">
  <div class="modes">
    <button class:active={t.mode === 'focus'} onclick={() => t.switchMode('focus')}>⚔ QUEST</button>
    <button class:active={t.mode === 'game'} onclick={() => t.switchMode('game')}>🎮 PLAY</button>
  </div>
  <PhaseTabs {t} pixel />
  <div class="title">{t.labelFor(t.timer.finished ? 'over' : t.timer.phase, TITLES)}</div>
  <div class="clock">{t.clock}</div>
  <div class="hp">
    {#each Array.from({ length: BLOCKS }, (_, i) => i) as i (i)}
      <span class="block" class:on={i < alive}></span>
    {/each}
  </div>
  {#if t.mode === 'focus'}
    <div class="hearts">
      {#each hearts as state, i (i)}<span class={state}>{state === 'empty' ? '♡' : '♥'}</span>{/each}
      <span class="xp">{Math.min(done, t.settings.rounds)}/{t.settings.rounds} · 🍅×{t.stats.sessions}</span>
    </div>
  {/if}
  <TaskInput {t} />
  <Presets {t} />
  <div class="buttons">
    <button onclick={() => t.reset()}>RESET</button>
    <button class="main" onclick={() => t.toggle()} disabled={t.timer.finished}>{t.timer.running ? 'PAUSE' : 'START'}</button>
    {#if t.mode === 'focus'}<button onclick={() => t.skip()}>SKIP</button>{/if}
  </div>
</div>

<style>
  .retro {
    --px: 'Press Start 2P', var(--font-mono);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-family: var(--px);
    image-rendering: pixelated;
  }
  .title { font-size: 9px; color: var(--phase); letter-spacing: 0.05em; }
  .clock { font-size: 30px; color: var(--text); text-shadow: 3px 3px 0 color-mix(in srgb, var(--phase) 45%, transparent); }
  .hp {
    display: grid;
    grid-template-columns: repeat(20, 1fr);
    gap: 2px;
    padding: 3px;
    width: min(100%, 250px);
    border: 2px solid var(--text-muted);
  }
  .block { height: 10px; background: color-mix(in srgb, var(--text) 8%, transparent); }
  .block.on { background: var(--phase); }
  .hearts { display: flex; gap: 5px; align-items: center; font-size: 13px; color: var(--text-muted); }
  .hearts .full { color: #ff7369; }
  .hearts .current { color: #ff7369; animation: pulse 1.2s steps(2) infinite; }
  @keyframes pulse { 50% { opacity: 0.35; } }
  .xp { font-size: 8px; margin-left: 6px; }
  .buttons { display: flex; gap: 6px; }
  button {
    font-family: var(--px);
    font-size: 8px;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--text);
    background: var(--bg-card);
    border: 2px solid var(--text-muted);
    box-shadow: 3px 3px 0 color-mix(in srgb, var(--text) 18%, transparent);
  }
  button:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 color-mix(in srgb, var(--text) 18%, transparent); }
  button.main { background: var(--phase); color: #fff; border-color: var(--phase); }
  button:disabled { opacity: 0.4; }
  .modes { display: flex; gap: 6px; }
  .modes button { box-shadow: none; padding: 6px 8px; opacity: 0.55; }
  .modes button.active { opacity: 1; border-color: var(--phase); color: var(--phase); }
  .retro :global(.task), .retro :global(.presets button) { font-family: var(--px); font-size: 8px; }
  .retro :global(.presets button) { border-radius: 0; }
</style>
