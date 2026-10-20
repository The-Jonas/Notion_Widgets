<!-- Layout glass: céu animado ao fundo (cor muda com o tempo e com dia/noite)
     e um painel de vidro fosco por cima com o agora e a previsão. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName, kindOf, TEXT } from '../api';
  import { deg, dayHref } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const days = $derived(data.daily.slice(1, opts.days));
  const t = $derived(TEXT[opts.lang]);
  const today = $derived(data.daily[0]);

  // cores do céu: [fundo de cima, fundo de baixo, brilho 1, brilho 2]
  const SKIES: Record<string, string[]> = {
    clear: ['#1e6fd9', '#5ec2e8', '#ffd56b', '#7be0d6'],
    partly: ['#2c5d93', '#79a9cf', '#ffd98a', '#a8c8e8'],
    cloudy: ['#3d4654', '#7a8594', '#a7b0bd', '#596473'],
    fog: ['#55606c', '#9aa3ad', '#c7ccd2', '#7d8792'],
    drizzle: ['#2f4157', '#62809c', '#7fa6c9', '#45607c'],
    rain: ['#1e2c3f', '#41617f', '#5d8fbf', '#2f4d6b'],
    snow: ['#5f7ea3', '#c4d6ea', '#ffffff', '#9fbbd9'],
    storm: ['#1a1530', '#3e3366', '#8a6cff', '#ffdc49'],
    night: ['#0b1030', '#2b3270', '#6c63ff', '#c9d4ff'],
  };
  const sky = $derived(
    !data.current.isDay && ['clear', 'partly'].includes(kindOf(data.current.code))
      ? SKIES.night
      : SKIES[kindOf(data.current.code)],
  );
</script>

<div
  class="glass"
  class:still={!opts.animate}
  style:--c1={sky[0]} style:--c2={sky[1]} style:--g1={sky[2]} style:--g2={sky[3]}
>
  <span class="blob b1"></span>
  <span class="blob b2"></span>
  <div class="panel">
    <div class="now">
      <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={64} animate={opts.animate} />
      <div class="col">
        <span class="temp">{deg(data.current.temp)}</span>
        <span class="desc">{describe(data.current.code, opts.lang)}</span>
      </div>
      <div class="col right">
        <span class="city">{data.place}</span>
        {#if opts.showRegion && data.region}<span class="region">{data.region}</span>{/if}
        <span class="hl">{t.hi} {deg(today.max)} · {t.lo} {deg(today.min)}</span>
      </div>
    </div>
    <div class="days">
      {#each days as d, i (d.date)}
        <svelte:element this={dayHref(data, opts, d.date, i + 1) ? 'a' : 'div'} href={dayHref(data, opts, d.date, i + 1)} target="_blank" rel="noreferrer" class="day">
          <span>{dayName(d.date, i + 1, opts.lang)}</span>
          <WeatherIcon code={d.code} size={26} animate={opts.animate} />
          <b>{deg(d.max)}</b>
          <small>{deg(d.min)}</small>
        </svelte:element>
      {/each}
    </div>
  </div>
</div>

<style>
  .glass {
    position: relative; overflow: hidden; width: 100%; max-width: 640px;
    border-radius: 20px; padding: 16px; color: #fff;
    background: linear-gradient(160deg, var(--c1), var(--c2));
  }
  /* brilhos borrados que flutuam devagar atrás do vidro */
  .blob { position: absolute; border-radius: 50%; filter: blur(30px); opacity: 0.75; }
  .b1 { width: 180px; height: 180px; background: var(--g1); top: -60px; right: 40px; animation: float 9s ease-in-out infinite alternate; }
  .b2 { width: 220px; height: 160px; background: var(--g2); bottom: -80px; left: -30px; animation: float 11s ease-in-out infinite alternate-reverse; }
  .still .blob { animation: none; }
  @keyframes float { to { transform: translate(-40px, 20px) scale(1.15); } }
  .panel {
    position: relative; display: flex; flex-direction: column; gap: 12px;
    padding: 14px 16px; border-radius: 16px;
    background: rgb(255 255 255 / 0.14);
    border: 1px solid rgb(255 255 255 / 0.28);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
  }
  .panel :global(.cloud) { fill: #f2f6fb; }
  .now { display: flex; align-items: center; gap: 14px; }
  .col { display: flex; flex-direction: column; }
  .right { margin-left: auto; text-align: right; }
  .temp { font-size: 46px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }
  .desc { font-size: 13px; opacity: 0.9; }
  .city { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .region, .hl { font-size: 11px; opacity: 0.85; }
  .days { display: flex; justify-content: space-between; gap: 4px; padding-top: 10px; border-top: 1px solid rgb(255 255 255 / 0.2); }
  .day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; }
  .day span { opacity: 0.85; font-weight: 600; }
  .day small { opacity: 0.7; }
  a { color: inherit; text-decoration: none; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  a:hover { transform: translateY(-2px); }
</style>
