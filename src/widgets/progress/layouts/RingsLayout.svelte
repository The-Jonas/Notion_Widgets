<!-- Layout de anéis: um círculo de progresso por período, lado a lado,
     com a porcentagem no centro e o rótulo embaixo. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();

  const R = 40;
  const CIRC = 2 * Math.PI * R;
</script>

<div class="rings">
  {#each items as item (item.key)}
    <div class="ring" style:--fill={item.color}>
      <svg viewBox="-50 -50 100 100">
        <circle class="track" r={R} />
        <circle
          class="arc"
          r={R}
          stroke-dasharray={CIRC}
          stroke-dashoffset={CIRC * (1 - item.progress)}
          style:--circ={CIRC}
          transform="rotate(-90)"
        />
        <text class="percent" dy="0.35em">{item.percent}</text>
      </svg>
      <span class="label">{item.label}</span>
      {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .rings { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 18px 26px; }
  .ring { display: flex; flex-direction: column; align-items: center; width: 92px; text-align: center; }
  svg { width: 84px; height: 84px; }
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 10%, transparent); stroke-width: 8; }
  .arc { fill: none; stroke: var(--fill); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; animation: draw 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes draw { from { stroke-dashoffset: var(--circ); } }
  .percent { fill: var(--text); font-size: 17px; font-weight: 700; text-anchor: middle; font-variant-numeric: tabular-nums; }
  .label { margin-top: 6px; font-size: 12px; font-weight: 600; color: var(--text); }
  .detail { margin-top: 2px; font-size: 10px; color: var(--text-muted); }
</style>
