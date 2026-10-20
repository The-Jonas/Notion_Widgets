<script lang="ts">
  import { getParam } from '../../shared/params';
  import { TimerController } from './controller.svelte';
  import Settings from './parts/Settings.svelte';
  import RingFace from './faces/RingFace.svelte';
  import OrbitFace from './faces/OrbitFace.svelte';
  import PillFace from './faces/PillFace.svelte';
  import CardFace from './faces/CardFace.svelte';
  import RetroFace from './faces/RetroFace.svelte';
  import MinimalFace from './faces/MinimalFace.svelte';
  import TerminalFace from './faces/TerminalFace.svelte';

  const style = getParam('style', 'ring');
  const t = new TimerController(getParam('mode', 'focus') === 'game' ? 'game' : 'focus');

  // relógio interno: 4x por segundo basta pra contagem e é leve pra CPU
  $effect(() => {
    const id = setInterval(() => t.tick(Date.now()), 250);
    return () => clearInterval(id);
  });

  // salva tudo sempre que algo muda (sobrevive a reload do Notion)
  $effect(() => {
    t.persist();
  });
</script>

<main class="timer" data-phase={t.timer.phase}>
  <Settings {t} />
  {#if style === 'orbit'}
    <OrbitFace {t} />
  {:else if style === 'pill'}
    <PillFace {t} />
  {:else if style === 'card'}
    <CardFace {t} />
  {:else if style === 'retro'}
    <RetroFace {t} />
  {:else if style === 'minimal'}
    <MinimalFace {t} />
  {:else if style === 'terminal'}
    <TerminalFace {t} />
  {:else}
    <RingFace {t} />
  {/if}
</main>

<style>
  /* cor da fase atual: foco usa o accent, pausas verde, game rosa */
  .timer { --phase: var(--accent); }
  .timer[data-phase='short'],
  .timer[data-phase='long'] { --phase: #4dab9a; }
  .timer[data-phase='game'] { --phase: #e255a1; }

  .timer {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
</style>
