<!-- Mostrador digital simples: hora grande + data por extenso. -->
<script lang="ts">
  import { type ClockOptions, formatTime, formatLongDate } from '../options';

  let { now, opts }: { now: Date; opts: ClockOptions } = $props();
</script>

<div class="digital">
  <span class="time">{formatTime(now, opts, opts.showSeconds)}</span>
  {#if opts.showDate}<span class="date">{formatLongDate(now, opts)}</span>{/if}
</div>

<style>
  .digital { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .time {
    font-family: var(--font-mono);
    font-size: clamp(28px, 14vw, 56px);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--accent);
  }
  .date { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
</style>
