<!-- Layout sol: arco do nascer ao pôr do sol com o sol andando pela posição de agora
     (à noite, a lua e a contagem até o sol nascer), mais a temperatura atual. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, TEXT } from '../api';
  import { deg, clock, minutesBetween, duration } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const t = $derived(TEXT[opts.lang]);
  const today = $derived(data.daily[0]);
  const tomorrow = $derived(data.daily[1] ?? data.daily[0]);
  const now = $derived(data.current.time);

  const dayLen = $derived(minutesBetween(today.sunrise, today.sunset));
  const passed = $derived(minutesBetween(today.sunrise, now));
  const isDaylight = $derived(passed >= 0 && passed <= dayLen);
  // fração do dia de sol já passada (0 = nascer, 1 = pôr)
  const frac = $derived(Math.min(1, Math.max(0, passed / dayLen)));

  // arco: semicírculo de (20,100) a (280,100) com raio 130 e centro (150,100)
  const R = 130;
  const angle = $derived(Math.PI * (1 - frac));
  const sunX = $derived(150 + R * Math.cos(angle));
  const sunY = $derived(100 - R * Math.sin(angle));
  const arcLen = Math.PI * R;

  // à noite: minutos até o próximo nascer (hoje cedo ainda não nasceu, ou amanhã)
  const untilSunrise = $derived(passed < 0 ? -passed : minutesBetween(now, tomorrow.sunrise));
</script>

<div class="sunw">
  <div class="left">
    <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={52} animate={opts.animate} />
    <span class="temp">{deg(data.current.temp)}</span>
    <span class="desc">{describe(data.current.code, opts.lang)}</span>
    <span class="city">{data.place}</span>
    {#if opts.showRegion && data.region}<span class="region">{data.region}</span>{/if}
  </div>
  <div class="right">
    <svg viewBox="0 -40 300 145">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffa344" />
          <stop offset="0.5" stop-color="#ffdc49" />
          <stop offset="1" stop-color="#ff7369" />
        </linearGradient>
      </defs>
      <line x1="0" y1="100" x2="300" y2="100" class="horizon" />
      <path d="M 20 100 A {R} {R} 0 0 1 280 100" class="track" />
      {#if isDaylight}
        <path
          d="M 20 100 A {R} {R} 0 0 1 280 100"
          class="done"
          stroke-dasharray={arcLen}
          stroke-dashoffset={arcLen * (1 - frac)}
        />
        <circle cx={sunX} cy={sunY} r="16" class="glow" />
        <circle cx={sunX} cy={sunY} r="9" class="sun" />
      {:else}
        <circle cx="150" cy="-20" r="9" class="moon" />
        <circle cx="155" cy="-24" r="8" class="moon-cut" />
      {/if}
    </svg>
    <div class="times">
      <span><small>{t.sunrise}</small>{clock(today.sunrise)}</span>
      <span class="mid">
        {#if isDaylight}{duration(dayLen - passed)} {t.daylightLeft}{:else}{t.sunriseIn} {duration(untilSunrise)}{/if}
      </span>
      <span class="r"><small>{t.sunset}</small>{clock(today.sunset)}</span>
    </div>
  </div>
</div>

<style>
  .sunw { width: 100%; max-width: 560px; display: flex; align-items: center; gap: 24px; }
  .left { display: flex; flex-direction: column; align-items: flex-start; min-width: 130px; }
  .temp { font-size: 44px; font-weight: 700; line-height: 1; margin-top: 4px; }
  .desc { font-size: 13px; }
  .city { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-top: 6px; }
  .region { font-size: 10px; color: var(--text-muted); }
  .right { flex: 0 1 300px; margin-left: auto; display: flex; flex-direction: column; }
  svg { width: 100%; height: auto; overflow: visible; }
  .horizon { stroke: var(--border); stroke-width: 1.5; }
  .track { fill: none; stroke: color-mix(in srgb, var(--text) 18%, transparent); stroke-width: 2; stroke-dasharray: 4 6; }
  .done { fill: none; stroke: url(#sky); stroke-width: 3.5; stroke-linecap: round; }
  .glow { fill: #ffdc49; opacity: 0.25; }
  .sun { fill: #ffc53d; }
  .moon { fill: #d7defa; }
  .moon-cut { fill: var(--bg-page); }
  :global([data-bg='transparent']) .moon-cut { fill: #191919; }
  :global([data-theme='light'][data-bg='transparent']) .moon-cut { fill: #ffffff; }
  .times { padding: 0 2px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 13px; font-weight: 700; }
  .times span { display: flex; flex-direction: column; }
  .times small { font-size: 10px; font-weight: 500; color: var(--text-muted); }
  .times .r { text-align: right; }
  .mid { font-size: 11px; font-weight: 500; color: var(--text-muted); text-align: center; }
</style>
