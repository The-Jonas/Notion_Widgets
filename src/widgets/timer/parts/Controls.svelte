<!-- Botões principais: reiniciar, iniciar/pausar e pular fase. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  let { t, compact = false }: { t: TimerController; compact?: boolean } = $props();
</script>

<div class="controls" class:compact>
  <button class="ghost" onclick={() => t.reset()} title="Reset (click again to restart the cycle)">↺</button>
  <button class="main" onclick={() => t.toggle()} disabled={t.timer.finished}>
    {t.timer.running ? '❚❚' : '▶'}{#if !compact}&nbsp;{t.timer.running ? 'Pause' : 'Start'}{/if}
  </button>
  {#if t.mode === 'focus'}
    <button class="ghost" onclick={() => t.skip()} title="Skip">⏭</button>
  {/if}
</div>

<style>
  .controls { display: flex; align-items: center; justify-content: center; gap: 8px; }
  button { border: none; cursor: pointer; color: var(--text); font-family: var(--font-sans); }
  .main {
    background: var(--phase);
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    padding: 8px 20px;
    border-radius: 999px;
    min-width: 104px;
  }
  .compact .main { min-width: 0; width: 38px; height: 38px; padding: 0; border-radius: 50%; }
  .main:disabled { opacity: 0.4; cursor: default; }
  .ghost {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 7%, transparent);
    font-size: 14px;
  }
  button:hover:not(:disabled) { filter: brightness(1.15); }
</style>
