<script lang="ts">
  import { getParam } from '../../shared/params';
  import { readOptions } from './options';
  import ClassicFace from './faces/ClassicFace.svelte';
  import MinimalFace from './faces/MinimalFace.svelte';
  import OrbitFace from './faces/OrbitFace.svelte';
  import DotsFace from './faces/DotsFace.svelte';
  import StackFace from './faces/StackFace.svelte';
  import DigitalFace from './faces/DigitalFace.svelte';

  const style = getParam('style', 'orbit');
  const opts = readOptions();

  // estilos que mostram os segundos de forma contínua (precisam de 60fps)
  const SMOOTH_STYLES = ['analog', 'hybrid', 'minimal', 'orbit'];

  let now = $state(new Date());

  // atualiza a hora: requestAnimationFrame quando o estilo anima os segundos
  // de forma contínua, senão 1x por segundo (bem mais leve pra CPU)
  $effect(() => {
    if (opts.sweep && SMOOTH_STYLES.includes(style)) {
      let frame = 0;
      const tick = () => {
        now = new Date();
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }
    const id = setInterval(() => (now = new Date()), 1000);
    return () => clearInterval(id);
  });
</script>

<main>
  {#if style === 'analog' || style === 'hybrid'}
    <ClassicFace {now} {opts} hybrid={style === 'hybrid'} />
  {:else if style === 'minimal'}
    <MinimalFace {now} {opts} />
  {:else if style === 'dots'}
    <DotsFace {now} {opts} />
  {:else if style === 'stack'}
    <StackFace {now} {opts} />
  {:else if style === 'digital'}
    <DigitalFace {now} {opts} />
  {:else}
    <OrbitFace {now} {opts} />
  {/if}
</main>

<style>
  main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* todos os mostradores em SVG ocupam o espaço mantendo-se redondos */
  main :global(svg) {
    width: 100%;
    height: 100%;
    max-width: 100vh;
    padding: 4px;
  }
</style>
