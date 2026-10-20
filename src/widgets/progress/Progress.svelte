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

<main>
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
  {:else}
    <BarsLayout {items} {opts} />
  {/if}
</main>

<style>
  main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
  }
</style>
