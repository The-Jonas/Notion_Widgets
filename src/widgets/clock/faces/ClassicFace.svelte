<!-- Mostrador analógico clássico (estilos "analog" e "hybrid"):
     marcações de minuto, anel de segundos e ponteiros. -->
<script lang="ts">
  import { type ClockOptions, timeParts, formatTime, formatShortDate } from '../options';

  let { now, opts, hybrid = false }: { now: Date; opts: ClockOptions; hybrid?: boolean } = $props();

  const RING_R = 92;
  const RING_LEN = 2 * Math.PI * RING_R;
  // 60 marcações; a cada 5 é marca de hora (maior)
  const ticks = Array.from({ length: 60 }, (_, i) => ({ angle: i * 6, major: i % 5 === 0 }));

  const t = $derived(timeParts(now, opts.sweep));
  const ringOffset = $derived(RING_LEN * (1 - t.seconds / 60));
</script>

<svg viewBox="-100 -100 200 200" role="img" aria-label={formatTime(now, opts)}>
  <circle class="face" r="96" />

  {#if opts.showSeconds}
    <circle class="ring-track" r={RING_R} />
    <circle class="ring" r={RING_R} stroke-dasharray={RING_LEN} stroke-dashoffset={ringOffset} transform="rotate(-90)" />
  {/if}

  {#each ticks as tk (tk.angle)}
    <line class="tick" class:major={tk.major} y1={tk.major ? -84 : -86} y2="-80" transform="rotate({tk.angle})" />
  {/each}

  {#if opts.numerals}
    <text class="numeral" y="-62">12</text>
    <text class="numeral" x="66" y="4">3</text>
    <text class="numeral" y="70">6</text>
    <text class="numeral" x="-66" y="4">9</text>
  {/if}

  {#if hybrid}
    <text class="inner-time" y="34">{formatTime(now, opts)}</text>
    {#if opts.showDate}<text class="inner-date" y="48">{formatShortDate(now, opts)}</text>{/if}
  {:else if opts.showDate}
    <text class="inner-date" y="40">{formatShortDate(now, opts)}</text>
  {/if}

  <line class="hand hour" y1="8" y2="-46" transform="rotate({t.hours * 30})" />
  <line class="hand minute" y1="10" y2="-70" transform="rotate({t.minutes * 6})" />
  {#if opts.showSeconds}
    <g transform="rotate({t.seconds * 6})">
      <line class="hand second" y1="16" y2="-78" />
      <circle class="accent-fill" cy="16" r="3" />
    </g>
  {/if}
  <circle class="accent-fill" r="4.5" />
  <circle class="hub-inner" r="1.8" />
</svg>

<style>
  .face { fill: color-mix(in srgb, var(--text) 3%, transparent); stroke: var(--border); }
  .ring-track { fill: none; stroke: color-mix(in srgb, var(--accent) 12%, transparent); stroke-width: 2; }
  .ring { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; opacity: 0.8; }
  .tick { stroke: var(--text-muted); stroke-width: 1; stroke-linecap: round; opacity: 0.45; }
  .tick.major { stroke: var(--text); stroke-width: 2.4; opacity: 0.9; }
  .numeral { fill: var(--text-muted); font-size: 13px; font-weight: 600; text-anchor: middle; }
  .inner-time { fill: var(--text); font-family: var(--font-mono); font-size: 15px; font-weight: 600; text-anchor: middle; }
  .inner-date { fill: var(--text-muted); font-size: 8.5px; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.18em; }
  .hand { stroke-linecap: round; }
  .hour { stroke: var(--text); stroke-width: 5.5; }
  .minute { stroke: var(--text); stroke-width: 3.5; opacity: 0.92; }
  .second { stroke: var(--accent); stroke-width: 1.4; }
  .accent-fill { fill: var(--accent); }
  .hub-inner { fill: var(--bg-page); }
</style>
