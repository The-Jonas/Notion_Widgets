<script lang="ts">
  import { getParam, getBool } from '../../shared/params';

  // opções vindas da URL
  const hour12 = getParam('format', '24') === '12';
  const showSeconds = getBool('seconds', false);
  const showDate = getBool('date', true);
  const lang = getParam('lang', 'en-US');

  let now = $state(new Date());

  // atualiza o relógio a cada segundo e limpa o timer quando o widget sai da tela
  $effect(() => {
    const id = setInterval(() => (now = new Date()), 1000);
    return () => clearInterval(id);
  });

  // monta a hora (HH:MM ou HH:MM:SS) no formato 12h ou 24h
  function formatTime(d: Date): string {
    return d.toLocaleTimeString(lang, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12,
    });
  }

  // monta a data por extenso, ex.: "Monday, October 19"
  function formatDate(d: Date): string {
    return d.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const time = $derived(formatTime(now));
  const date = $derived(formatDate(now));
</script>

<main class="clock">
  <span class="time">{time}</span>
  {#if showDate}
    <span class="date">{date}</span>
  {/if}
</main>

<style>
  .clock {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .time {
    font-family: var(--font-mono);
    font-size: clamp(28px, 14vw, 56px);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--accent);
  }

  .date {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }
</style>
