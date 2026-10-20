<!-- Layout faixa: tudo numa linha só, pra blocos baixos (ex.: 90 px de altura). -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, dayName } from '../api';
  import { deg, dayAction } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts, onpick }: { data: WeatherData; opts: WeatherOptions; onpick: (index: number) => void } = $props();
  const days = $derived(data.daily.slice(1, opts.days));
</script>

<div class="strip">
  <div class="now">
    <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={36} animate={opts.animate} />
    <div class="col">
      <span class="temp">{deg(data.current.temp)}</span>
      <span class="city" title={data.region}>{data.place}</span>
      {#if opts.showRegion && data.region}<span class="region">{data.region}</span>{/if}
    </div>
  </div>
  <div class="divider"></div>
  <div class="days">
    {#each days as d, i (d.date)}
      {@const act = dayAction(data, opts, d.date, i + 1, onpick)}
      <svelte:element this={act.tag} {...act.attrs} class="day">
        <span class="name">{dayName(d.date, i + 1, opts.lang)}</span>
        <WeatherIcon code={d.code} size={20} animate={opts.animate} />
        <span class="range">{deg(d.max)}<i>{deg(d.min)}</i></span>
      </svelte:element>
    {/each}
  </div>
</div>

<style>
  .strip { width: 100%; max-width: 680px; display: flex; align-items: center; gap: 14px; }
  .now { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .col { display: flex; flex-direction: column; }
  .temp { font-size: 24px; font-weight: 700; line-height: 1; }
  .city { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .region { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
  .divider { width: 1px; align-self: stretch; background: var(--border); }
  .days { flex: 1; display: flex; justify-content: space-between; gap: 4px; overflow: hidden; }
  .day { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .name { font-size: 10px; font-weight: 600; color: var(--text-muted); }
  .range { font-size: 11px; font-weight: 600; }
  .range i { font-style: normal; color: var(--text-muted); margin-left: 4px; font-weight: 400; }
  /* blocos clicáveis: link ou botão sem o visual padrão do navegador */
  a, button { all: unset; box-sizing: border-box; color: inherit; text-decoration: none; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  a:hover, button:hover { transform: translateY(-2px); }
</style>
