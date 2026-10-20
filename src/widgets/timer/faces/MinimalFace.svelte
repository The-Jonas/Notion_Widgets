<!-- Estilo "minimal": só o tempo bem grande, uma linha fina de progresso
     e controles discretos em texto. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import ModeTabs from '../parts/ModeTabs.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';
  import TodayStats from '../parts/TodayStats.svelte';

  let { t }: { t: TimerController } = $props();
</script>

<div class="face">
  <ModeTabs {t} />
  <PhaseTabs {t} />
  <span class="label">{t.label}</span>
  <span class="clock">{t.clock}</span>
  <div class="line"><div class="line-fill" style:width="{t.progress * 100}%"></div></div>
  <div class="links">
    <button class="primary" onclick={() => t.toggle()} disabled={t.timer.finished}>{t.timer.running ? 'pause' : 'start'}</button>
    <span>·</span>
    <button onclick={() => t.reset()}>reset</button>
    {#if t.mode === 'focus'}<span>·</span><button onclick={() => t.skip()}>skip</button>{/if}
  </div>
  <TaskInput {t} />
  <Presets {t} />
  {#if t.mode === 'focus'}<TodayStats {t} />{/if}
</div>

<style>
  .face { display: flex; flex-direction: column; align-items: center; gap: 6px; width: min(100%, 320px); }
  .label { font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: var(--phase); }
  .clock {
    font-size: clamp(48px, 22vw, 84px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }
  .line { width: 100%; height: 2px; background: color-mix(in srgb, var(--text) 10%, transparent); }
  .line-fill { height: 100%; background: var(--phase); transition: width 0.25s linear; }
  .links { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--text-muted); }
  button { border: none; background: none; cursor: pointer; color: var(--text-muted); font: 12px var(--font-sans); letter-spacing: 0.08em; padding: 2px; }
  button:hover { color: var(--text); }
  button.primary { color: var(--phase); font-weight: 700; }
  button:disabled { opacity: 0.4; }
</style>
