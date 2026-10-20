<!-- Abas para trocar entre o modo Focus e o modo Game. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  let { t }: { t: TimerController } = $props();
</script>

{#if t.allowGame}
<nav class="tabs">
  <button class:active={t.mode === 'focus'} onclick={() => t.switchMode('focus')}>🎯 Focus</button>
  <button class:active={t.mode === 'game'} onclick={() => t.switchMode('game')}>🎮 Game</button>
</nav>
{/if}

<style>
  .tabs {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text) 6%, transparent);
  }
  button {
    border: none;
    cursor: pointer;
    background: transparent;
    padding: 3px 11px;
    border-radius: 999px;
    font: 12px var(--font-sans);
    color: var(--text-muted);
  }
  button.active { background: color-mix(in srgb, var(--phase) 22%, transparent); color: var(--text); }
</style>
