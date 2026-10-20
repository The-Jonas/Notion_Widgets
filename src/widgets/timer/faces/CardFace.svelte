<!-- Estilo "card": cartão com cabeçalho, tempo grande alinhado à esquerda,
     barra de progresso, tarefa e rodapé com estatísticas e botões. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import ModeTabs from '../parts/ModeTabs.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Controls from '../parts/Controls.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';
  import TodayStats from '../parts/TodayStats.svelte';

  let { t }: { t: TimerController } = $props();
</script>

<div class="card">
  <header>
    <span class="chip">{t.label}</span>
    <ModeTabs {t} />
  </header>
  <PhaseTabs {t} />
  <div class="clock">{t.clock}</div>
  <div class="bar"><div class="bar-fill" style:width="{t.progress * 100}%"></div></div>
  <div class="meta">
    <span>{t.subtitle}</span>
    {#if t.mode === 'focus'}<TodayStats {t} />{/if}
  </div>
  <TaskInput {t} />
  <Presets {t} />
  <Controls {t} />
</div>

<style>
  .card {
    width: min(100%, 320px);
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    box-shadow: 0 6px 24px rgb(0 0 0 / 0.25);
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  header { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-right: 18px; }
  .chip {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--phase);
    background: color-mix(in srgb, var(--phase) 14%, transparent);
    padding: 4px 8px;
    border-radius: 6px;
  }
  .clock { font-family: var(--font-mono); font-size: 46px; font-weight: 700; color: var(--text); line-height: 1; }
  .bar { height: 6px; border-radius: 999px; background: color-mix(in srgb, var(--text) 8%, transparent); overflow: hidden; }
  .bar-fill { height: 100%; background: var(--phase); border-radius: 999px; transition: width 0.25s linear; }
  .meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); }
  .card :global(.task) { text-align: left; width: 100%; }
  .card :global(.presets), .card :global(.phases) { justify-content: flex-start; }
  .card :global(.phases) { margin-left: -7px; }
</style>
