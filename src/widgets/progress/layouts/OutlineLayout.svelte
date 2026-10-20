<!-- Layout contornado: barra com borda e preenchimento afastado da borda,
     texto "Rótulo: 65%" à direita (versão repaginada do clássico do Indify). -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();
</script>

<div class="outline">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color}>
      <div class="track"><div class="fill" style:width="{item.progress * 100}%"></div></div>
      <div class="text">
        <span class="main">{item.label}: <b>{item.percent}</b></span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .outline { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 12px; }
  .row { display: grid; grid-template-columns: 1fr 130px; align-items: center; gap: 14px; }
  .track { height: 26px; border: 2px solid var(--text); border-radius: 9px; padding: 3px; }
  .fill { height: 100%; min-width: 8px; border-radius: 5px; background: var(--fill); transition: width 0.6s ease; }
  .text { display: flex; flex-direction: column; line-height: 1.25; }
  .main { font-size: 14px; color: var(--text); }
  .main b { font-weight: 700; font-variant-numeric: tabular-nums; }
  .detail { font-size: 11px; color: var(--text-muted); }
</style>
