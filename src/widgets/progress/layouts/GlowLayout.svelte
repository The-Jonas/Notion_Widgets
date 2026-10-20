<!-- Layout glow: barra grossa com degradê e brilho, e uma bolha com a
     porcentagem que acompanha a ponta do preenchimento. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="glow">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color} style:--p={item.progress}>
      <div class="head">
        <span class="label">{item.label}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
      </div>
      <div class="track">
        <div class="fill"></div>
        <span class="bubble">{item.percent}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .glow { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 10px; padding: 0 22px 0 10px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
  .label { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .detail { font-size: 11px; color: var(--text-muted); }
  .track { position: relative; height: 12px; border-radius: 99px; background: color-mix(in srgb, var(--text) 8%, transparent); }
  .fill {
    width: calc(var(--p) * 100%);
    min-width: 12px;
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--fill) 35%, transparent), var(--fill));
    box-shadow: 0 0 12px color-mix(in srgb, var(--fill) 55%, transparent);
    transition: width 0.6s ease;
    transform-origin: left;
    animation: grow 1s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes grow { from { transform: scaleX(0); } }
  /* bolha centralizada na ponta do preenchimento */
  .bubble {
    position: absolute;
    top: 50%;
    left: calc(var(--p) * 100%);
    transform: translate(-50%, -50%);
    padding: 2px 7px;
    border-radius: 99px;
    background: var(--fill);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    box-shadow: 0 0 0 3px var(--bg-page);
    transition: left 0.6s ease;
  }
</style>
