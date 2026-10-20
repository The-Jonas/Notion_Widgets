<!-- Mostrador minimalista: sem marcações de minuto, só 4 pontos,
     ponteiros grossos arredondados e os segundos como um ponto orbitando. -->
<script lang="ts">
  import { type ClockOptions, timeParts, formatTime, formatShortDate } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();

  const t = $derived(timeParts(now, opts.sweep));
</script>

<svg viewBox="-100 -100 200 200" role="img" aria-label={formatTime(now, opts)}>
  <circle class="face" r="94" />

  <!-- 4 pontos nos quartos de hora -->
  {#each [0, 90, 180, 270] as angle (angle)}
    <circle class="quarter" cy="-80" r="3" transform="rotate({angle})" />
  {/each}

  {#if opts.showDate}
    <text class="date" y="46">{formatShortDate(now, opts)}</text>
  {/if}

  <line class="hand hour" y2="-44" transform="rotate({t.hours * 30})" />
  <line class="hand minute" y2="-68" transform="rotate({t.minutes * 6})" />

  <!-- segundos: um ponto que dá a volta na borda -->
  {#if opts.showSeconds}
    <circle class="second-dot" cy="-80" r="4" transform="rotate({t.seconds * 6})" />
  {/if}

  <circle class="hub" r="6" />
</svg>

<style>
  .face { fill: color-mix(in srgb, var(--text) 4%, transparent); }
  .quarter { fill: var(--text-muted); opacity: 0.7; }
  .date { fill: var(--text-muted); font-size: 9px; font-weight: 600; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.2em; }
  .hand { stroke-linecap: round; }
  .hour { stroke: var(--text); stroke-width: 9; }
  .minute { stroke: var(--accent); stroke-width: 6; }
  .second-dot { fill: var(--accent); }
  .hub { fill: var(--text); }
</style>
