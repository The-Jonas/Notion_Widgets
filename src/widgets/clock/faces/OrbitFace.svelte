<!-- Mostrador "orbit": sem ponteiros, três anéis de progresso
     (horas, minutos, segundos) com a hora digital no centro. -->
<script lang="ts">
  import { type ClockOptions, timeParts, formatTime, formatShortDate, hourMinute } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();

  // raios dos anéis, de fora pra dentro
  const RINGS = { hours: 88, minutes: 74, seconds: 60 };

  // devolve o comprimento total e o offset de um anel pra fração p (0 a 1)
  function arc(r: number, p: number): { len: number; offset: number } {
    const len = 2 * Math.PI * r;
    return { len, offset: len * (1 - p) };
  }

  const t = $derived(timeParts(now, opts.sweep));
  const h = $derived(arc(RINGS.hours, t.hours / 12));
  const m = $derived(arc(RINGS.minutes, t.minutes / 60));
  const s = $derived(arc(RINGS.seconds, t.seconds / 60));
  const hm = $derived(hourMinute(now, opts));
</script>

<svg viewBox="-100 -100 200 200" role="img" aria-label={formatTime(now, opts)}>
  <g transform="rotate(-90)">
    <circle class="track" r={RINGS.hours} />
    <circle class="ring hours" r={RINGS.hours} stroke-dasharray={h.len} stroke-dashoffset={h.offset} />
    <circle class="track" r={RINGS.minutes} />
    <circle class="ring minutes" r={RINGS.minutes} stroke-dasharray={m.len} stroke-dashoffset={m.offset} />
    {#if opts.showSeconds}
      <circle class="track" r={RINGS.seconds} />
      <circle class="ring seconds" r={RINGS.seconds} stroke-dasharray={s.len} stroke-dashoffset={s.offset} />
    {/if}
  </g>

  <text class="time" y={opts.showDate ? 4 : 10}>
    {hm.hh}<tspan class="colon">:</tspan>{hm.mm}
  </text>
  {#if opts.showDate}
    <text class="date" y="22">{formatShortDate(now, opts)}</text>
  {/if}
</svg>

<style>
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 7%, transparent); stroke-width: 9; }
  .ring { fill: none; stroke-width: 9; stroke-linecap: round; }
  .hours { stroke: var(--accent); }
  .minutes { stroke: color-mix(in srgb, var(--accent) 65%, var(--text)); }
  .seconds { stroke: var(--text-muted); stroke-width: 5; }
  .time { fill: var(--text); font-family: var(--font-mono); font-size: 28px; font-weight: 700; text-anchor: middle; }
  .colon { fill: var(--accent); }
  .date { fill: var(--text-muted); font-size: 9px; font-weight: 600; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.2em; }
</style>
