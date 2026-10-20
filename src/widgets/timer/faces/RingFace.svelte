<!-- Estilo "ring": anel de progresso clássico com o tempo no centro. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import ModeTabs from '../parts/ModeTabs.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Controls from '../parts/Controls.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';
  import TodayStats from '../parts/TodayStats.svelte';

  let { t }: { t: TimerController } = $props();

  const R = 84;
  const LEN = 2 * Math.PI * R;
</script>

<div class="face">
  <ModeTabs {t} />
  <PhaseTabs {t} />
  <svg viewBox="-100 -100 200 200">
    <circle class="track" r={R} />
    <circle class="ring" r={R} stroke-dasharray={LEN} stroke-dashoffset={LEN * (1 - t.progress)} transform="rotate(-90)" />
    <text class="label" y="-24">{t.label}</text>
    <text class="clock" y="14">{t.clock}</text>
    <text class="sub" y="36">{t.subtitle}</text>
  </svg>
  <TaskInput {t} />
  <Presets {t} />
  <Controls {t} />
  {#if t.mode === 'focus'}<TodayStats {t} />{/if}
</div>

<style>
  .face { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  svg { width: 170px; height: 170px; }
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 7%, transparent); stroke-width: 8; }
  .ring { fill: none; stroke: var(--phase); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }
  .label { fill: var(--phase); font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-anchor: middle; }
  .clock { fill: var(--text); font-family: var(--font-mono); font-size: 34px; font-weight: 700; text-anchor: middle; }
  .sub { fill: var(--text-muted); font-size: 9px; letter-spacing: 0.1em; text-anchor: middle; }
</style>
