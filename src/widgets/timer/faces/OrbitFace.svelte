<!-- Estilo "orbit": anel grosso do tempo + anel interno em gomos,
     um gomo por round (os já concluídos ficam acesos). -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import ModeTabs from '../parts/ModeTabs.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Controls from '../parts/Controls.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';
  import TodayStats from '../parts/TodayStats.svelte';

  let { t }: { t: TimerController } = $props();

  const R_OUT = 86;
  const R_IN = 66;
  const LEN_OUT = 2 * Math.PI * R_OUT;
  const LEN_IN = 2 * Math.PI * R_IN;
  const GAP = 6; // espaço entre os gomos (em unidades do SVG)

  // monta um gomo do anel interno: tamanho e posição de cada round
  function segment(i: number, total: number): { dash: string; offset: number } {
    const piece = LEN_IN / total;
    return { dash: `${piece - GAP} ${LEN_IN - piece + GAP}`, offset: -i * piece };
  }

  // diz se o gomo do round i (base 0) está concluído, em andamento ou vazio
  function segmentState(i: number): 'done' | 'current' | 'todo' {
    const done = t.timer.phase === 'focus' ? t.timer.round - 1 : t.timer.round;
    if (i < done) return 'done';
    if (i === done && t.timer.phase === 'focus') return 'current';
    return 'todo';
  }
</script>

<div class="face">
  <ModeTabs {t} />
  <PhaseTabs {t} />
  <svg viewBox="-100 -100 200 200">
    <g transform="rotate(-90)">
      <circle class="track" r={R_OUT} />
      <circle class="ring" r={R_OUT} stroke-dasharray={LEN_OUT} stroke-dashoffset={LEN_OUT * (1 - t.progress)} />
      {#if t.mode === 'focus'}
        {#each Array.from({ length: t.settings.rounds }, (_, i) => i) as i (i)}
          {@const seg = segment(i, t.settings.rounds)}
          <circle class="seg {segmentState(i)}" r={R_IN} stroke-dasharray={seg.dash} stroke-dashoffset={seg.offset} />
        {/each}
      {/if}
    </g>
    <text class="clock" y="8">{t.clock}</text>
    <text class="label" y="26">{t.label}</text>
  </svg>
  <TaskInput {t} />
  <Presets {t} />
  <Controls {t} compact />
  {#if t.mode === 'focus'}<TodayStats {t} />{/if}
</div>

<style>
  .face { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  svg { width: 180px; height: 180px; }
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 7%, transparent); stroke-width: 12; }
  .ring { fill: none; stroke: var(--phase); stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }
  .seg { fill: none; stroke-width: 5; stroke-linecap: round; }
  .seg.todo { stroke: color-mix(in srgb, var(--text) 10%, transparent); }
  .seg.current { stroke: color-mix(in srgb, var(--phase) 45%, transparent); }
  .seg.done { stroke: var(--phase); }
  .clock { fill: var(--text); font-family: var(--font-mono); font-size: 30px; font-weight: 700; text-anchor: middle; }
  .label { fill: var(--text-muted); font-size: 8.5px; font-weight: 700; letter-spacing: 0.22em; text-anchor: middle; }
</style>
