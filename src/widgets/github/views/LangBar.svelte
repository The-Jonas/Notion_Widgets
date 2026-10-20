<!-- Barra das linguagens mais usadas, com legenda embaixo. -->
<script lang="ts">
  import { langColor } from '../langs';

  let { langs, mono, light }: { langs: { name: string; share: number }[]; mono: boolean; light: boolean } = $props();
</script>

<div class="langs">
  <div class="bar">
    {#each langs as l, i (l.name)}
      <span style:width="{l.share * 100}%" style:background={langColor(l.name, mono, i, light)}></span>
    {/each}
  </div>
  <div class="legend">
    {#each langs as l, i (l.name)}
      <span><i style:background={langColor(l.name, mono, i, light)}></i>{l.name} <small>{Math.round(l.share * 100)}%</small></span>
    {/each}
  </div>
</div>

<style>
  .bar { display: flex; height: 6px; border-radius: 99px; overflow: hidden; gap: 2px; }
  .bar span { height: 100%; }
  .legend { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 6px; font-size: 11px; }
  .legend span { display: flex; align-items: center; gap: 5px; }
  .legend i { width: 8px; height: 8px; border-radius: 50%; }
  .legend small { color: var(--text-muted); }
</style>
