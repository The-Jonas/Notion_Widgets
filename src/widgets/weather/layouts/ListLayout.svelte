<!-- Layout lista: previsão na vertical com uma barra de faixa de temperatura
     por dia (mínima → máxima) na escala da semana, estilo app de clima do celular. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName } from '../api';
  import { deg, dayAction } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts, onpick }: { data: WeatherData; opts: WeatherOptions; onpick: (index: number) => void } = $props();
  const days = $derived(data.daily.slice(0, opts.days));
  const lo = $derived(Math.min(...days.map((d) => d.min)));
  const hi = $derived(Math.max(...days.map((d) => d.max)));

  /** Posição (0 a 1) de uma temperatura dentro da faixa da semana. */
  function pos(t: number): number {
    return hi === lo ? 0.5 : (t - lo) / (hi - lo);
  }
</script>

<div class="list">
  <header>
    <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={34} animate={opts.animate} />
    <span class="temp">{deg(data.current.temp)}</span>
    <span class="desc">{describe(data.current.code, opts.lang)}</span>
    <span class="city">{data.place}{#if opts.showRegion && data.region}<small>{data.region}</small>{/if}</span>
  </header>
  {#each days as d, i (d.date)}
    {@const act = dayAction(data, opts, d.date, i, onpick)}
    <svelte:element this={act.tag} {...act.attrs} class="row">
      <span class="name">{dayName(d.date, i, opts.lang)}</span>
      <span class="icon">
        <WeatherIcon code={d.code} size={22} animate={opts.animate} />
        {#if d.rain >= 30}<small>{d.rain}%</small>{/if}
      </span>
      <span class="min">{deg(d.min)}</span>
      <span class="track">
        <span class="range" style:left="{pos(d.min) * 100}%" style:right="{(1 - pos(d.max)) * 100}%"></span>
        {#if i === 0}<span class="dot" style:left="{pos(data.current.temp) * 100}%"></span>{/if}
      </span>
      <span class="max">{deg(d.max)}</span>
    </svelte:element>
  {/each}
</div>

<style>
  .list { width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 4px; }
  header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
  header :global(svg) { align-self: center; }
  .temp { font-size: 26px; font-weight: 700; }
  .desc { font-size: 13px; }
  .city { margin-left: auto; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.12em; }
  .city { display: flex; flex-direction: column; align-items: flex-end; }
  .city small { font-size: 10px; letter-spacing: 0; text-transform: none; }
  .row {
    display: grid; grid-template-columns: 52px 48px 34px 1fr 34px; align-items: center; gap: 8px;
    padding: 4px 0; border-top: 1px solid var(--border);
  }
  .name { font-size: 13px; font-weight: 600; }
  .icon { display: flex; align-items: center; gap: 2px; }
  .icon small { font-size: 9px; color: #529cca; font-weight: 700; }
  .min { font-size: 12px; color: var(--text-muted); text-align: right; }
  .max { font-size: 12px; font-weight: 700; }
  .track { position: relative; height: 5px; border-radius: 99px; background: color-mix(in srgb, var(--text) 10%, transparent); }
  /* faixa do dia: azul nas mínimas, laranja nas máximas */
  .range { position: absolute; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, #4dab9a, #ffc53d, #ff7369); }
  .dot { position: absolute; top: 50%; width: 9px; height: 9px; border-radius: 50%; background: #fff; border: 2px solid var(--bg-page); transform: translate(-50%, -50%); }
  /* blocos clicáveis: link ou botão sem o visual padrão do navegador */
  a, button { all: unset; box-sizing: border-box; color: inherit; text-decoration: none; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  a:hover, button:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
</style>
