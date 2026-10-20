<!-- Mostrador minimalista: sem marcações de minuto, só 4 pontos (ou 12/3/6/9),
     ponteiros grossos arredondados e os segundos como um ponto orbitando.
     Opcional: hora digital em fonte arredondada acima do dia da semana. -->
<script lang="ts">
  import { type ClockOptions, timeParts, formatTime, formatShortDate, hourMinute } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();

  const t = $derived(timeParts(now, opts.sweep));
  const hm = $derived(hourMinute(now, opts));

  // números dos quartos de hora: ângulo + texto
  const QUARTERS = [
    { angle: 0, label: '12' },
    { angle: 90, label: '3' },
    { angle: 180, label: '6' },
    { angle: 270, label: '9' },
  ];

  /** Converte um ângulo do mostrador (0 = topo) em coordenadas x/y no raio dado. */
  function polar(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.sin(rad) * radius, y: -Math.cos(rad) * radius };
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap" rel="stylesheet" />
</svelte:head>

<svg viewBox="-100 -100 200 200" role="img" aria-label={formatTime(now, opts)}>
  <circle class="face" r="94" />

  <!-- quartos de hora: números 12/3/6/9 ou 4 pontos -->
  {#each QUARTERS as q (q.angle)}
    {#if opts.numerals}
      {@const p = polar(q.angle, 78)}
      <text class="numeral" x={p.x} y={p.y}>{q.label}</text>
    {:else}
      <circle class="quarter" cy="-80" r="3" transform="rotate({q.angle})" />
    {/if}
  {/each}

  <!-- hora digital acima do dia da semana -->
  {#if opts.digits}
    <text class="digits" y={opts.showDate ? 40 : 48}>{hm.hh}:{hm.mm}</text>
  {/if}

  {#if opts.showDate}
    <text class="date" y={opts.digits ? 55 : 46}>{formatShortDate(now, opts)}</text>
  {/if}

  <line class="hand hour" y2="-44" transform="rotate({t.hours * 30})" />
  <line class="hand minute" y2="-68" transform="rotate({t.minutes * 6})" />

  <!-- segundos: um ponto que dá a volta na borda (mais pra fora quando há números) -->
  {#if opts.showSeconds}
    <circle class="second-dot" cy={opts.numerals ? -88 : -80} r="4" transform="rotate({t.seconds * 6})" />
  {/if}

  <circle class="hub" r="6" />
</svg>

<style>
  .face { fill: color-mix(in srgb, var(--text) 4%, transparent); }
  .quarter { fill: var(--text-muted); opacity: 0.7; }
  .numeral {
    fill: var(--text-muted);
    font-family: 'Fredoka', var(--font-sans);
    font-size: 15px;
    font-weight: 600;
    text-anchor: middle;
    dominant-baseline: central;
  }
  .digits {
    fill: var(--text);
    font-family: 'Fredoka', var(--font-sans);
    font-size: 21px;
    font-weight: 600;
    text-anchor: middle;
    letter-spacing: 0.02em;
  }
  .date { fill: var(--text-muted); font-size: 9px; font-weight: 600; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.2em; }
  .hand { stroke-linecap: round; }
  .hour { stroke: var(--text); stroke-width: 9; }
  .minute { stroke: var(--accent); stroke-width: 6; }
  .second-dot { fill: var(--accent); }
  .hub { fill: var(--text); }
</style>
