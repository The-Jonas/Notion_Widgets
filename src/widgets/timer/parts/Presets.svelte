<!-- Atalhos de tempo: ciclos (25/5, 50/10...) no Focus; no Game, uma linha de
     tempos prontos e um ajuste fino separado (−5m −1m | +1m +5m).
     Somem enquanto o timer está rodando, pra não mudar o tempo sem querer. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import { FOCUS_PRESETS, GAME_PRESETS } from '../engine';
  let { t }: { t: TimerController } = $props();

  const STEPS = [-5, -1, 1, 5];

  // nome curto de um tempo pronto: 30m, 1h, 1h30, 2h
  function presetLabel(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  }

  // nome de um passo do ajuste fino, sempre com sinal e unidade: −5m, +1m
  function stepLabel(step: number): string {
    return `${step < 0 ? '−' : '+'}${Math.abs(step)}m`;
  }
</script>

{#if !t.timer.running}
  {#if t.mode === 'focus'}
    <div class="presets">
      {#each FOCUS_PRESETS as p (p.label)}
        <button class:active={t.activePreset === p.label} onclick={() => t.applyPreset(p.focus, p.short, p.long)}>
          {p.label}
        </button>
      {/each}
    </div>
  {:else}
    <div class="game">
      <div class="presets">
        {#each GAME_PRESETS as p (p)}
          <button class:active={t.timer.gameMinutes === p} onclick={() => t.setGameMinutes(p)}>{presetLabel(p)}</button>
        {/each}
      </div>
      <div class="stepper" role="group" aria-label="Adjust time">
        {#each STEPS as step, i (step)}
          {#if i === STEPS.length / 2}<span class="divider"></span>{/if}
          <button onclick={() => t.setGameMinutes(t.timer.gameMinutes + step)}>{stepLabel(step)}</button>
        {/each}
      </div>
    </div>
  {/if}
{/if}

<style>
  .game { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .presets { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
  button {
    border: none;
    cursor: pointer;
    color: var(--text);
    background: color-mix(in srgb, var(--text) 6%, transparent);
    padding: 3px 10px;
    border-radius: var(--radius);
    font: 12px var(--font-mono);
    min-width: 46px;
  }
  button.active { background: var(--phase); color: #fff; }

  /* ajuste fino: um bloco único, mais discreto que os tempos prontos */
  .stepper {
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--text) 4%, transparent);
    overflow: hidden;
  }
  .stepper button {
    background: none;
    border-radius: 0;
    color: var(--text-muted);
    font-size: 11px;
    min-width: 40px;
    padding: 3px 8px;
  }
  .stepper button:hover { color: var(--text); background: color-mix(in srgb, var(--text) 6%, transparent); }
  .divider { width: 1px; align-self: stretch; margin: 4px 0; background: color-mix(in srgb, var(--text) 14%, transparent); }
</style>
