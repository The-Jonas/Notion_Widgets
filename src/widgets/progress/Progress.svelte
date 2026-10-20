<!-- Widget de progresso: calcula os períodos e escolhe o layout pelo ?style= -->
<script lang="ts">
  import { getParam } from '../../shared/params';
  import { readOptions, computePeriods } from './periods';
  import BarsLayout from './layouts/BarsLayout.svelte';
  import OutlineLayout from './layouts/OutlineLayout.svelte';
  import RingsLayout from './layouts/RingsLayout.svelte';
  import BlocksLayout from './layouts/BlocksLayout.svelte';
  import CardsLayout from './layouts/CardsLayout.svelte';
  import RetroLayout from './layouts/RetroLayout.svelte';
  import ConcentricLayout from './layouts/ConcentricLayout.svelte';
  import DotsLayout from './layouts/DotsLayout.svelte';
  import ColumnsLayout from './layouts/ColumnsLayout.svelte';
  import GlowLayout from './layouts/GlowLayout.svelte';
  import TextLayout from './layouts/TextLayout.svelte';

  const style = getParam('style', 'bars');
  const opts = readOptions();

  let now = $state(new Date());
  const items = $derived(computePeriods(now, opts));

  // atualiza 1x por segundo (o "faltam Xh Ym" e as casas decimais mudam rápido)
  $effect(() => {
    const id = setInterval(() => (now = new Date()), 1000);
    return () => clearInterval(id);
  });
</script>

<main class:retro-title={style === 'retro'}>
  {#if opts.title}<h1 class="title">{opts.title}</h1>{/if}
  {#if style === 'outline'}
    <OutlineLayout {items} {opts} />
  {:else if style === 'rings'}
    <RingsLayout {items} {opts} />
  {:else if style === 'blocks'}
    <BlocksLayout {items} {opts} />
  {:else if style === 'cards'}
    <CardsLayout {items} {opts} />
  {:else if style === 'retro'}
    <RetroLayout {items} {opts} />
  {:else if style === 'concentric'}
    <ConcentricLayout {items} {opts} />
  {:else if style === 'dots'}
    <DotsLayout {items} {opts} />
  {:else if style === 'columns'}
    <ColumnsLayout {items} {opts} />
  {:else if style === 'glow'}
    <GlowLayout {items} {opts} />
  {:else if style === 'text'}
    <TextLayout {items} {opts} />
  {:else}
    <BarsLayout {items} {opts} />
  {/if}
</main>

<style>
  main {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
  }
  .title {
    margin: 0;
    width: 100%;
    max-width: 600px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .retro-title .title { font-family: 'Press Start 2P', var(--font-mono); font-size: 9px; letter-spacing: 0; }
</style>
