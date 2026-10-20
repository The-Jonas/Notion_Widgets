<!-- Layout retrô: barras pixeladas estilo barra de XP de jogo antigo,
     com a fonte Press Start 2P (combina com o timer retro). -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();

  const CELLS = 24;
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
</svelte:head>

<div class="retro">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color}>
      <div class="head">
        <span class="label">{item.label}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
        <span class="percent">{item.percent}</span>
      </div>
      <div class="bar">
        {#each { length: CELLS } as _, i (i)}
          <span class="cell" class:on={i < Math.floor(item.progress * CELLS)}></span>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .retro {
    --px: 'Press Start 2P', var(--font-mono);
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: var(--px);
  }
  .head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
  .label { font-size: 9px; text-transform: uppercase; color: var(--text); }
  .detail { font-size: 7px; color: var(--text-muted); text-transform: uppercase; }
  .percent { margin-left: auto; font-size: 9px; color: var(--fill); }
  /* moldura de pixel: borda dupla feita com box-shadow, sem cantos arredondados */
  .bar {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    gap: 2px;
    padding: 3px;
    background: var(--bg-page);
    box-shadow: 0 0 0 2px var(--text), 0 0 0 4px var(--bg-page);
  }
  .cell { height: 10px; background: color-mix(in srgb, var(--text) 8%, transparent); }
  .cell.on { background: var(--fill); box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.25); }
</style>
