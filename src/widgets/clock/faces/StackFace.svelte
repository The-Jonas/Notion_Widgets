<!-- Mostrador tipográfico: hora em cima, minutos embaixo no accent,
     números grandes empilhados (estilo tela de bloqueio). -->
<script lang="ts">
  import { type ClockOptions, formatLongDate, hourMinute } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();

  const hm = $derived(hourMinute(now, opts));
  const ss = $derived(String(now.getSeconds()).padStart(2, '0'));
</script>

<div class="stack">
  <span class="hh">{hm.hh}</span>
  <span class="mm">{hm.mm}{#if opts.showSeconds}<small>{ss}</small>{/if}</span>
  {#if opts.showDate}<span class="date">{formatLongDate(now, opts)}</span>{/if}
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 0.88;
    font-variant-numeric: tabular-nums;
  }
  .hh, .mm {
    font-size: clamp(40px, 26vw, 110px);
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .hh { color: var(--text); }
  .mm { color: var(--accent); position: relative; }
  small {
    position: absolute;
    left: 100%;
    bottom: 0.2em;
    margin-left: 4px;
    font-size: 0.18em;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }
  .date {
    margin-top: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--text-muted);
  }
</style>
