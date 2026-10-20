<!-- Layout padrão: rótulo e porcentagem em cima, barra fina arredondada embaixo. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="bars">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color}>
      <div class="head">
        <span class="label">{item.label}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
        <span class="percent">{item.percent}</span>
      </div>
      <div class="track"><div class="fill" style:width="{item.progress * 100}%"></div></div>
    </div>
  {/each}
</div>

<style>
  .bars { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 14px; }
  .head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
  .label { font-size: 13px; font-weight: 600; color: var(--text); }
  .detail { font-size: 11px; color: var(--text-muted); }
  .percent { margin-left: auto; font-size: 13px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
  .track { height: 8px; border-radius: 99px; background: color-mix(in srgb, var(--text) 10%, transparent); overflow: hidden; }
  .fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, color-mix(in srgb, var(--fill) 70%, transparent), var(--fill)); transition: width 0.6s ease; transform-origin: left; animation: grow 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes grow { from { transform: scaleX(0); } }

</style>
