<!-- Layout em blocos: a barra é dividida em 20 quadradinhos (estilo bateria);
     o bloco atual fica parcialmente aceso conforme a fração. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();

  const CELLS = 20;

  /** Devolve o quanto (0 a 1) a célula de índice "i" está preenchida. */
  function cellFill(progress: number, i: number): number {
    return Math.min(1, Math.max(0, progress * CELLS - i));
  }
</script>

<div class="blocks">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color}>
      <div class="name">
        <span class="label">{item.label}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
      </div>
      <div class="cells">
        {#each { length: CELLS } as _, i (i)}
          <span class="cell"><span class="lit" style:opacity={cellFill(item.progress, i)}></span></span>
        {/each}
      </div>
      <span class="percent">{item.percent}</span>
    </div>
  {/each}
</div>

<style>
  .blocks { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 12px; }
  .row { display: grid; grid-template-columns: 96px 1fr 52px; align-items: center; gap: 12px; }
  .name { display: flex; flex-direction: column; line-height: 1.2; }
  .label { font-size: 13px; font-weight: 600; color: var(--text); }
  .detail { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
  .cells { display: grid; grid-template-columns: repeat(20, 1fr); gap: 3px; }
  .cell { height: 16px; border-radius: 3px; background: color-mix(in srgb, var(--text) 9%, transparent); overflow: hidden; }
  .lit { display: block; width: 100%; height: 100%; background: var(--fill); }
  .percent { font-size: 13px; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
</style>
