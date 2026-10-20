<!-- Layout clássico: cabeçalho com cidade, ícone e temperatura atual,
     e embaixo a previsão dos próximos dias em colunas (estilo Indify, repaginado). -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName, TEXT } from '../api';
  import { deg, windText, dayAction } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts, onpick }: { data: WeatherData; opts: WeatherOptions; onpick: (index: number) => void } = $props();
  const days = $derived(data.daily.slice(0, opts.days));
  const t = $derived(TEXT[opts.lang]);
</script>

<div class="classic">
  <header>
    <div class="place">
      <span class="city">{data.place}</span>
      {#if opts.showRegion && data.region}<span class="region">{data.region}</span>{/if}
      <span class="sub">{describe(data.current.code, opts.lang)}</span>
    </div>
    <div class="now">
      <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={46} animate={opts.animate} />
      <span class="temp">{deg(data.current.temp)}</span>
    </div>
    {#if opts.details}
      <ul class="details">
        <li><span>{t.feels}</span>{deg(data.current.feels)}</li>
        <li><span>{t.humidity}</span>{data.current.humidity}%</li>
        <li><span>{t.wind}</span>{windText(data.current.wind, opts)}</li>
      </ul>
    {/if}
  </header>

  <div class="days" style:--n={days.length}>
    {#each days as d, i (d.date)}
      {@const act = dayAction(data, opts, d.date, i, onpick)}
      <svelte:element this={act.tag} {...act.attrs} class="day" class:today={i === 0}>
        <span class="name">{dayName(d.date, i, opts.lang)}</span>
        <WeatherIcon code={d.code} size={30} animate={opts.animate} />
        <span class="max">{deg(d.max)}</span>
        <span class="min">{deg(d.min)}</span>
      </svelte:element>
    {/each}
  </div>
</div>

<style>
  .classic { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 14px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 6px; }
  .place { display: flex; flex-direction: column; min-width: 0; }
  .city { font-size: 15px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .region { font-size: 11px; color: var(--text-muted); }
  .sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .now { display: flex; align-items: center; gap: 10px; }
  .temp { font-size: 38px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
  .details { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; font-size: 12px; font-weight: 600; text-align: right; }
  .details span { color: var(--text-muted); font-weight: 500; margin-right: 6px; }
  .days { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 6px; }
  .day {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 8px 2px; border-radius: 10px;
  }
  .day.today { background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .name { font-size: 12px; font-weight: 600; }
  .today .name { color: var(--accent); }
  .max { font-size: 13px; font-weight: 700; }
  .min { font-size: 12px; color: var(--text-muted); }
  @media (max-width: 460px) { .details { display: none; } }
  /* blocos clicáveis: link ou botão sem o visual padrão do navegador */
  a, button { all: unset; box-sizing: border-box; color: inherit; text-decoration: none; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  a:hover, button:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--text) 6%, transparent); }
</style>
