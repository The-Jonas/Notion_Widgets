<!-- Layout hero: cartão com fundo em degradê que muda com o tempo e com dia/noite,
     temperatura grande e a previsão em "pílulas" translúcidas. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName, kindOf, TEXT } from '../api';
  import { deg, windText } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const days = $derived(data.daily.slice(0, opts.days));
  const t = $derived(TEXT[opts.lang]);
  const today = $derived(data.daily[0]);

  // degradê do cartão conforme o tempo agora (e se é noite)
  const GRADIENTS: Record<string, string> = {
    clear: 'linear-gradient(135deg, #2f80c9, #4dab9a)',
    partly: 'linear-gradient(135deg, #3a6f9c, #5f8fb3)',
    cloudy: 'linear-gradient(135deg, #4a5563, #6b7686)',
    fog: 'linear-gradient(135deg, #59616b, #868e98)',
    drizzle: 'linear-gradient(135deg, #34495e, #4f6d86)',
    rain: 'linear-gradient(135deg, #263a52, #3e5f80)',
    snow: 'linear-gradient(135deg, #6c88a8, #a9c1dc)',
    storm: 'linear-gradient(135deg, #2b2340, #4b3c6e)',
    night: 'linear-gradient(135deg, #1b2347, #3a3f7a)',
  };
  const gradient = $derived(
    !data.current.isDay && ['clear', 'partly'].includes(kindOf(data.current.code))
      ? GRADIENTS.night
      : GRADIENTS[kindOf(data.current.code)],
  );
</script>

<div class="hero" style:background={gradient}>
  <div class="top">
    <div>
      <span class="city">{data.place}</span>
      <span class="temp">{deg(data.current.temp)}</span>
      <span class="desc">{describe(data.current.code, opts.lang)} · {t.hi} {deg(today.max)} {t.lo} {deg(today.min)}</span>
    </div>
    <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={86} animate={opts.animate} />
  </div>
  {#if opts.details}
    <div class="chips">
      <span>{t.feels} {deg(data.current.feels)}</span>
      <span>💧 {data.current.humidity}%</span>
      <span>🌬 {windText(data.current.wind, opts)}</span>
    </div>
  {/if}
  <div class="days">
    {#each days.slice(1) as d, i (d.date)}
      <div class="pill">
        <span class="name">{dayName(d.date, i + 1, opts.lang)}</span>
        <WeatherIcon code={d.code} size={24} animate={opts.animate} />
        <span class="range"><b>{deg(d.max)}</b> {deg(d.min)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .hero {
    width: 100%; max-width: 640px; border-radius: 18px; padding: 16px 18px; color: #fff;
    display: flex; flex-direction: column; gap: 10px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
  }
  /* no cartão colorido as nuvens ficam sempre claras, em qualquer tema */
  .hero :global(.cloud) { fill: #eef3f8; }
  .hero :global(.cloud.dark) { fill: #a7b0bf; }
  .top { display: flex; justify-content: space-between; align-items: center; }
  .top > div { display: flex; flex-direction: column; }
  .city { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9; }
  .temp { font-size: 54px; font-weight: 800; line-height: 1; letter-spacing: -0.04em; margin: 2px 0; }
  .desc { font-size: 13px; opacity: 0.9; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chips span { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; background: rgb(255 255 255 / 0.16); }
  .days { display: flex; gap: 6px; }
  .pill {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 7px 2px; border-radius: 12px; background: rgb(255 255 255 / 0.12);
  }
  .name { font-size: 11px; font-weight: 600; opacity: 0.9; }
  .range { font-size: 11px; opacity: 0.85; white-space: nowrap; }
  .range b { opacity: 1; }
</style>
