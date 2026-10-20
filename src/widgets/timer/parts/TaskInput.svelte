<!-- Campo "no que estou focando" (salvo no navegador). Só aparece no Focus. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  let { t }: { t: TimerController } = $props();
</script>

{#if t.mode === 'focus'}
  <input class="task" placeholder="Working on…" bind:value={t.task} maxlength="60" />
{/if}

<style>
  .task {
    width: min(100%, 240px);
    background: transparent;
    border: none;
    border-bottom: 1px dashed color-mix(in srgb, var(--text) 18%, transparent);
    color: var(--text);
    font: 12px var(--font-sans);
    text-align: center;
    padding: 3px 4px;
    outline: none;
  }
  .task:focus { border-bottom-color: var(--phase); }
  .task::placeholder { color: var(--text-muted); opacity: 0.7; }
</style>
