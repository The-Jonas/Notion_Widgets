<!-- Layout de colunas: barras verticais lado a lado que enchem de baixo pra cima,
     com a porcentagem em cima e o rótulo embaixo. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="columns">
  {#each items as item (item.key)}
    <div class="col" style:--fill={item.color}>
      <span class="percent">{item.percent}</span>
      <div class="tube"><div class="fill" style:height="{item.progress * 100}%"></div></div>
      <span class="label">{item.label}</span>
      {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .columns { display: flex; justify-content: center; align-items: flex-end; gap: 22px; flex-wrap: wrap; }
  .col { display: flex; flex-direction: column; align-items: center; width: 84px; text-align: center; }
  .percent { font-size: 14px; font-weight: 700; margin-bottom: 6px; font-variant-numeric: tabular-nums; }
  .tube {
    position: relative;
    width: 34px;
    height: 110px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--text) 9%, transparent);
    overflow: hidden;
  }
  .fill {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    border-radius: 10px;
    background: linear-gradient(to top, var(--fill), color-mix(in srgb, var(--fill) 65%, white));
    transition: height 0.6s ease;
    transform-origin: bottom;
    animation: rise 1s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes rise { from { transform: scaleY(0); } }
  .label { margin-top: 8px; font-size: 12px; font-weight: 600; }
  .detail { margin-top: 2px; font-size: 10px; color: var(--text-muted); }
</style>
