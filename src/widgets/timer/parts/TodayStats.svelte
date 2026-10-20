<!-- Resumo do dia: focos completos e minutos focados. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import { formatMinutes } from '../engine';
  let { t }: { t: TimerController } = $props();
</script>

<span class="stats" title="Today">🍅 {t.stats.sessions} · {formatMinutes(t.stats.minutes)} today</span>

<style>
  .stats { font-size: 11px; color: var(--text-muted); letter-spacing: 0.04em; }
</style>
