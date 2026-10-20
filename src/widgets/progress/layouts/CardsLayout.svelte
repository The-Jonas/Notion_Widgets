<!-- Layout de cards: um cartão por período com a porcentagem grande
     e uma barrinha na base. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="cards">
  {#each items as item (item.key)}
    <div class="card" style:--fill={item.color}>
      <span class="label">{item.label}</span>
      <span class="percent">{item.percent}</span>
      {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
      <div class="track"><div class="fill" style:width="{item.progress * 100}%"></div></div>
    </div>
  {/each}
</div>

<style>
  .cards { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 10px; }
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 14px 16px;
    border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    overflow: hidden;
    background-image: radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--fill) 16%, transparent), transparent 60%);
  }
  .label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); }
  .percent { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); font-variant-numeric: tabular-nums; }
  .detail { font-size: 11px; color: var(--text-muted); }
  .track { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: color-mix(in srgb, var(--text) 8%, transparent); }
  .fill { height: 100%; background: var(--fill); transition: width 0.6s ease; transform-origin: left; animation: grow 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes grow { from { transform: scaleX(0); } }

</style>
