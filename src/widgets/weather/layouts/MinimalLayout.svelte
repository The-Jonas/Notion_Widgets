<!-- Layout minimalista: só o agora. Ícone, temperatura grande e uma linha de resumo. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe } from '../api';
  import { deg } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const today = $derived(data.daily[0]);
</script>

<div class="minimal">
  <WeatherIcon code={data.current.code} isDay={data.current.isDay} size={64} animate={opts.animate} />
  <div class="text">
    <span class="temp">{deg(data.current.temp)}</span>
    <span class="line">{describe(data.current.code, opts.lang)} · ↑{deg(today.max)} ↓{deg(today.min)}</span>
    <span class="city">{data.place}{opts.showRegion && data.region ? `  ·  ${data.region}` : ''}</span>
  </div>
</div>

<style>
  .minimal { display: flex; align-items: center; gap: 18px; }
  .text { display: flex; flex-direction: column; }
  .temp { font-size: 52px; font-weight: 300; line-height: 1; letter-spacing: -0.04em; }
  .line { font-size: 13px; margin-top: 4px; }
  .city { white-space: pre; font-size: 11px; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
</style>
