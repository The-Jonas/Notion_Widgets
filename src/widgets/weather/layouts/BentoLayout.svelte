<!-- Layout bento: grade de blocos. Um bloco grande com o agora e seis menores:
     sensação, umidade (anel), vento (bússola), UV (escala), chuva e sol. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, TEXT } from '../api';
  import { deg, windText, compass, uvLevel, clock } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const t = $derived(TEXT[opts.lang]);
  const pt = $derived(opts.lang === 'pt-BR');
  const today = $derived(data.daily[0]);
  const RING = 2 * Math.PI * 15;
</script>

<div class="bento">
  <div class="tile big">
    <div class="row">
      <span class="city">{data.place}</span>
      <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={40} animate={opts.animate} />
    </div>
    {#if opts.showRegion && data.region}<span class="region">{data.region}</span>{/if}
    <span class="temp">{deg(data.current.temp)}</span>
    <span class="desc">{describe(data.current.code, opts.lang)}</span>
    <span class="hl">{t.hi} {deg(today.max)} · {t.lo} {deg(today.min)}</span>
  </div>

  <div class="tile">
    <span class="label">🌡 {t.feels}</span>
    <span class="value">{deg(data.current.feels)}</span>
    <span class="hint">{data.current.feels > data.current.temp ? (pt ? 'mais quente' : 'warmer') : (pt ? 'mais frio' : 'cooler')}</span>
  </div>

  <div class="tile">
    <span class="label">💧 {t.humidity}</span>
    <div class="ringrow">
      <svg viewBox="0 0 40 40" class="ring">
        <circle cx="20" cy="20" r="15" class="ring-bg" />
        <circle cx="20" cy="20" r="15" class="ring-fg" stroke-dasharray={RING} stroke-dashoffset={RING * (1 - data.current.humidity / 100)} transform="rotate(-90 20 20)" />
      </svg>
      <span class="value">{data.current.humidity}%</span>
    </div>
  </div>

  <div class="tile">
    <span class="label">🌬 {t.wind}</span>
    <div class="ringrow">
      <svg viewBox="0 0 40 40" class="compass">
        <circle cx="20" cy="20" r="15" class="ring-bg" />
        <!-- seta aponta pra onde o vento vai (oposto de onde vem) -->
        <path d="M20 8 L24 22 L20 19 L16 22 Z" class="arrow" transform="rotate({data.current.windDir + 180} 20 20)" />
      </svg>
      <span class="value small">{windText(data.current.wind, opts)}<i>{compass(data.current.windDir, pt)}</i></span>
    </div>
  </div>

  <div class="tile">
    <span class="label">☀️ {t.uv}</span>
    <span class="value">{Math.round(today.uv)}<i>{uvLevel(today.uv, pt)}</i></span>
    <span class="uvbar"><span class="uvdot" style:left="{Math.min(100, (today.uv / 11) * 100)}%"></span></span>
  </div>

  <div class="tile">
    <span class="label">☔ {t.rain}</span>
    <span class="value">{today.rain}%</span>
    <span class="bar"><span style:width="{today.rain}%"></span></span>
  </div>

  <div class="tile">
    <span class="label">🌅 {pt ? 'Sol' : 'Sun'}</span>
    <span class="value small">{clock(today.sunrise)}<i>↑</i></span>
    <span class="value small">{clock(today.sunset)}<i>↓</i></span>
  </div>
</div>

<style>
  .bento {
    width: 100%; max-width: 660px; display: grid; gap: 8px;
    grid-template-columns: 1.5fr 1fr 1fr 1fr; grid-template-rows: repeat(2, minmax(86px, auto));
  }
  .tile {
    display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 14px;
    background: var(--bg-card); border: 1px solid var(--border); min-width: 0;
  }
  .big {
    grid-row: span 2; justify-content: center;
    background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 30%, var(--bg-card)), var(--bg-card));
  }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .city { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .region { font-size: 10px; color: var(--text-muted); margin-top: -6px; }
  .temp { font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -0.04em; margin-top: 6px; }
  .desc { font-size: 13px; }
  .hl { font-size: 11px; color: var(--text-muted); }
  .label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .value { font-size: 22px; font-weight: 700; line-height: 1.1; }
  .value.small { font-size: 15px; white-space: nowrap; }
  .value i { font-style: normal; font-size: 10px; font-weight: 600; color: var(--text-muted); margin-left: 5px; }
  .hint { font-size: 10px; color: var(--text-muted); }
  .ringrow { display: flex; align-items: center; gap: 8px; }
  .ring, .compass { width: 38px; height: 38px; flex-shrink: 0; }
  .ring-bg { fill: none; stroke: color-mix(in srgb, var(--text) 12%, transparent); stroke-width: 4; }
  .ring-fg { fill: none; stroke: #529cca; stroke-width: 4; stroke-linecap: round; }
  .arrow { fill: var(--accent); }
  .uvbar { position: relative; height: 5px; border-radius: 99px; margin-top: 4px; background: linear-gradient(90deg, #4dab9a, #ffdc49, #ffa344, #ff7369, #9a6dd7); }
  .uvdot { position: absolute; top: 50%; width: 9px; height: 9px; border-radius: 50%; background: #fff; border: 2px solid var(--bg-card); transform: translate(-50%, -50%); }
  .bar { height: 5px; border-radius: 99px; margin-top: 4px; background: color-mix(in srgb, var(--text) 12%, transparent); overflow: hidden; }
  .bar span { display: block; height: 100%; background: #529cca; border-radius: 99px; }
  @media (max-width: 520px) {
    .bento { grid-template-columns: 1fr 1fr; }
    .big { grid-row: auto; grid-column: span 2; }
  }
</style>
