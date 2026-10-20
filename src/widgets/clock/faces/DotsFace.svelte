<!-- Mostrador de pontos: 60 pontos em volta; os minutos já passados
     da hora acendem no accent e o segundo atual pisca em branco. -->
<script lang="ts">
  import { type ClockOptions, formatTime, formatShortDate, hourMinute } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();

  const dots = Array.from({ length: 60 }, (_, i) => ({ i, angle: i * 6, major: i % 5 === 0 }));

  const minute = $derived(now.getMinutes());
  const second = $derived(now.getSeconds());
  const hm = $derived(hourMinute(now, opts));

  // decide a classe de cada ponto: segundo atual, minuto passado ou apagado
  function dotClass(i: number): string {
    if (opts.showSeconds && i === second) return 'dot sec';
    if (i < minute) return 'dot on';
    return 'dot';
  }
</script>

<svg viewBox="-100 -100 200 200" role="img" aria-label={formatTime(now, opts)}>
  {#each dots as d (d.i)}
    <circle class={dotClass(d.i)} cy="-84" r={d.major ? 3.6 : 2.4} transform="rotate({d.angle})" />
  {/each}

  <text class="time" y={opts.showDate ? 6 : 12}>{hm.hh}<tspan class="accent">:</tspan>{hm.mm}</text>
  {#if opts.showDate}
    <text class="date" y="26">{formatShortDate(now, opts)}</text>
  {/if}
</svg>

<style>
  .dot { fill: color-mix(in srgb, var(--text) 14%, transparent); transition: fill 0.3s; }
  .dot.on { fill: var(--accent); }
  .dot.sec { fill: var(--text); }
  .time { fill: var(--text); font-family: var(--font-mono); font-size: 34px; font-weight: 700; text-anchor: middle; }
  .accent { fill: var(--accent); }
  .date { fill: var(--text-muted); font-size: 9.5px; font-weight: 600; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.2em; }
</style>
