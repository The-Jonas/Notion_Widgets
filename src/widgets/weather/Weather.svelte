<!-- Widget de clima: busca os dados, atualiza a cada 30 min e escolhe o layout pelo ?style= -->
<script lang="ts">
  import { getParam } from '../../shared/params';
  import { readOptions, fetchWeather, type WeatherData } from './api';
  import ClassicLayout from './layouts/ClassicLayout.svelte';
  import HeroLayout from './layouts/HeroLayout.svelte';
  import MinimalLayout from './layouts/MinimalLayout.svelte';
  import StripLayout from './layouts/StripLayout.svelte';
  import ListLayout from './layouts/ListLayout.svelte';
  import GlassLayout from './layouts/GlassLayout.svelte';
  import TerminalLayout from './layouts/TerminalLayout.svelte';
  import ChartLayout from './layouts/ChartLayout.svelte';
  import SunLayout from './layouts/SunLayout.svelte';
  import BentoLayout from './layouts/BentoLayout.svelte';
  import DayPanel from './DayPanel.svelte';

  const style = getParam('style', 'classic');
  const opts = readOptions();

  let data = $state<WeatherData | null>(null);
  let error = $state('');
  // dia aberto no painel de detalhes (null = fechado)
  let picked = $state<number | null>(null);
  const pick = (index: number) => (picked = index);

  /** Busca (ou relê do cache) e guarda o resultado. */
  async function load() {
    try {
      data = await fetchWeather(opts);
      error = '';
    } catch (e) {
      if (!data) error = (e as Error).message;
    }
  }

  $effect(() => {
    load();
    const id = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(id);
  });
</script>

<main>
  {#if error}
    <p class="note">☁️ {error}</p>
  {:else if !data}
    <p class="note loading">Loading weather…</p>
  {:else if style === 'hero'}
    <HeroLayout {data} {opts} onpick={pick} />
  {:else if style === 'minimal'}
    <MinimalLayout {data} {opts} />
  {:else if style === 'strip'}
    <StripLayout {data} {opts} onpick={pick} />
  {:else if style === 'list'}
    <ListLayout {data} {opts} onpick={pick} />
  {:else if style === 'glass'}
    <GlassLayout {data} {opts} onpick={pick} />
  {:else if style === 'terminal'}
    <TerminalLayout {data} {opts} />
  {:else if style === 'chart'}
    <ChartLayout {data} {opts} onpick={pick} />
  {:else if style === 'sun'}
    <SunLayout {data} {opts} />
  {:else if style === 'bento'}
    <BentoLayout {data} {opts} />
  {:else}
    <ClassicLayout {data} {opts} onpick={pick} />
  {/if}
  {#if data && picked !== null}
    <DayPanel {data} {opts} index={picked} onclose={() => (picked = null)} onnav={pick} />
  {/if}
</main>

<style>
  main { height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px 12px; }
  .note { max-width: 420px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.6; }
  .loading { animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 50% { opacity: 0.4; } }
</style>
