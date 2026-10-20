<!-- Layout concêntrico: anéis um dentro do outro (estilo anéis de atividade)
     com a legenda ao lado. Em cor única, cada anel usa uma opacidade diferente. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();

  // a espessura se ajusta pra caber todos os anéis (4 ou 5) no mesmo círculo
  const step = $derived(Math.min(12, 38 / Math.max(1, items.length)));
  const stroke = $derived(step * 0.76);

  /** Raio do anel de índice "i" (o primeiro período fica por fora). */
  function radius(i: number): number {
    return 46 - i * step;
  }

  /** Opacidade do anel: 1 no modo multicolor, decrescente na cor única. */
  function shade(i: number): number {
    return opts.multicolor ? 1 : Math.max(0.35, 1 - i * 0.18);
  }
</script>

<div class="concentric">
  <svg viewBox="-50 -50 100 100">
    {#each items as item, i (item.key)}
      {@const r = radius(i)}
      {@const c = 2 * Math.PI * r}
      <circle class="track" r={r} stroke-width={stroke} />
      <circle
        class="arc"
        r={r}
        stroke={item.color}
        stroke-width={stroke}
        opacity={shade(i)}
        stroke-dasharray={c}
        stroke-dashoffset={c * (1 - item.progress)}
        style:--circ={c}
        transform="rotate(-90)"
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each items as item, i (item.key)}
      <li>
        <span class="swatch" style:background={item.color} style:opacity={shade(i)}></span>
        <span class="label">{item.label}</span>
        <span class="percent">{item.percent}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .concentric { display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; }
  svg { width: 150px; height: 150px; flex-shrink: 0; }
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 9%, transparent); }
  .arc {
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;
    animation: draw 1s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes draw { from { stroke-dashoffset: var(--circ); } }
  .legend { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: auto auto auto; gap: 8px 10px; align-items: baseline; }
  li { display: contents; }
  .swatch { width: 10px; height: 10px; border-radius: 3px; align-self: center; }
  .label { font-size: 13px; font-weight: 600; }
  .percent { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
  .detail { grid-column: 2 / 4; margin-top: -6px; font-size: 10px; color: var(--text-muted); }
</style>
