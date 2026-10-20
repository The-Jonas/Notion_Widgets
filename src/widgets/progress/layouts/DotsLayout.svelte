<!-- Layout de pontinhos: cada período vira uma fileira de unidades
     (dia = 24 horas, semana e mês = dias, ano = 12 meses, personalizado = semanas).
     As que já passaram ficam acesas e a atual pulsa. -->
<script lang="ts">
  import type { PeriodItem, ProgressOptions } from '../periods';

  let { items, opts }: { items: PeriodItem[]; opts: ProgressOptions } = $props();

  /** Estado do ponto "i": já passou, é o atual ou ainda vem. */
  function dotState(item: PeriodItem, i: number): 'past' | 'now' | 'future' {
    if (i < Math.floor(item.unitsDone)) return 'past';
    if (i === Math.floor(item.unitsDone)) return 'now';
    return 'future';
  }
</script>

<div class="dots">
  {#each items as item (item.key)}
    <div class="row" style:--fill={item.color}>
      <div class="head">
        <span class="label">{item.label}</span>
        {#if opts.detail}<span class="detail">{item.detail}</span>{/if}
        <span class="percent">{item.percent}</span>
      </div>
      <div class="grid" style:--n={item.units}>
        {#each { length: item.units } as _, i (i)}
          <span class="dot {dotState(item, i)}"></span>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .dots { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 12px; }
  .head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
  .label { font-size: 13px; font-weight: 600; }
  .detail { font-size: 11px; color: var(--text-muted); }
  .percent { margin-left: auto; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
  /* os pontos se espalham por toda a largura, seja 7 ou 31 */
  .grid { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 4px; }
  .dot { aspect-ratio: 1; max-height: 12px; justify-self: center; width: 100%; max-width: 12px; border-radius: 50%; background: color-mix(in srgb, var(--text) 12%, transparent); }
  .dot.past { background: var(--fill); }
  .dot.now { background: var(--fill); animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 color-mix(in srgb, var(--fill) 60%, transparent); }
    50% { opacity: 0.55; box-shadow: 0 0 0 4px color-mix(in srgb, var(--fill) 0%, transparent); }
  }
</style>
