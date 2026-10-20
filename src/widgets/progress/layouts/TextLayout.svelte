<!-- Layout tipográfico: porcentagens grandes lado a lado, sem caixas,
     com uma linha fina de progresso embaixo de cada número. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="text">
  {#each items as item (item.key)}
    <div class="cell" style:--fill={item.color}>
      <span class="label">{item.label}</span>
      <span class="percent">{item.percent}</span>
      <div class="line"><div class="fill" style:width="{item.progress * 100}%"></div></div>
      {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .text { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 18px 24px; }
  .cell { display: flex; flex-direction: column; }
  .label { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
  .percent { font-size: clamp(30px, 7vw, 46px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; color: var(--fill); font-variant-numeric: tabular-nums; }
  .line { height: 2px; margin-top: 6px; background: color-mix(in srgb, var(--text) 12%, transparent); }
  .fill { height: 100%; background: var(--fill); transform-origin: left; animation: grow 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes grow { from { transform: scaleX(0); } }
  .detail { margin-top: 6px; font-size: 11px; color: var(--text-muted); }
</style>
