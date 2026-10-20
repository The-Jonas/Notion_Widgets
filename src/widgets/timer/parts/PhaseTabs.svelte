<!-- Abas de fase do pomodoro (Focus / Short / Long): troca de fase na mão.
     Só aparece no modo Focus. "pixel" deixa o visual quadrado do estilo retro. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import type { Phase } from '../engine';
  let { t, pixel = false }: { t: TimerController; pixel?: boolean } = $props();

  const PHASES: { id: Phase; label: string }[] = [
    { id: 'focus', label: 'Focus' },
    { id: 'short', label: 'Short' },
    { id: 'long', label: 'Long' },
  ];
</script>

{#if t.mode === 'focus'}
  <div class="phases" class:pixel>
    {#each PHASES as ph (ph.id)}
      <button class:active={t.timer.phase === ph.id} onclick={() => t.setPhase(ph.id)}>{ph.label}</button>
    {/each}
  </div>
{/if}

<style>
  .phases { display: flex; gap: 4px; }
  button {
    border: none;
    cursor: pointer;
    background: none;
    color: var(--text-muted);
    font: 600 10px var(--font-sans);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 3px 7px;
    border-radius: 6px;
  }
  button:hover { color: var(--text); }
  button.active { color: var(--phase); background: color-mix(in srgb, var(--phase) 12%, transparent); }

  .pixel button { font-family: 'Press Start 2P', var(--font-mono); font-size: 7px; letter-spacing: 0; border-radius: 0; }
  .pixel button.active { outline: 2px solid var(--phase); }
</style>
