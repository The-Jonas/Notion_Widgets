<!-- Layout terminal: o clima como saída de um comando, com ícones em arte ASCII
     coloridos e cursor piscando (cara de área dev). -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName, kindOf, TEXT } from '../api';
  import { deg, windText, compass } from '../format';

  let { data, opts }: { data: WeatherData; opts: WeatherOptions } = $props();
  const days = $derived(data.daily.slice(0, opts.days));
  const t = $derived(TEXT[opts.lang]);
  const pt = $derived(opts.lang === 'pt-BR');

  // arte ASCII de cada tipo de tempo (5 linhas) e a cor de cada linha
  const ART: Record<string, { lines: string[]; colors: string[] }> = {
    clear: { lines: ['   \\  |  /  ', '    .---.   ', ' --(     )--', "    '---'   ", '   /  |  \\  '], colors: ['sun', 'sun', 'sun', 'sun', 'sun'] },
    partly: { lines: ['  \\  /      ', ' _ /"".--.  ', '   \\_(    ).', '   /(___.__)', '            '], colors: ['sun', 'sun', 'cloud', 'cloud', 'cloud'] },
    cloudy: { lines: ['            ', '     .--.   ', '  .-(    ). ', ' (___.__)__)', '            '], colors: ['cloud', 'cloud', 'cloud', 'cloud', 'cloud'] },
    fog: { lines: ['            ', ' _ - _ - _ -', '  _ - _ - _ ', ' _ - _ - _ -', '            '], colors: ['fog', 'fog', 'fog', 'fog', 'fog'] },
    drizzle: { lines: ['     .-.    ', '    (   ).  ', '   (___(__) ', "    ' ' ' ' ", "   ' ' ' '  "], colors: ['cloud', 'cloud', 'cloud', 'rain', 'rain'] },
    rain: { lines: ['     .-.    ', '    (   ).  ', '   (___(__) ', "  ‚'‚'‚'‚'  ", "  ‚'‚'‚'‚'  "], colors: ['cloud', 'cloud', 'cloud', 'rain', 'rain'] },
    snow: { lines: ['     .-.    ', '    (   ).  ', '   (___(__) ', '   *  *  *  ', '  *  *  *   '], colors: ['cloud', 'cloud', 'cloud', 'snow', 'snow'] },
    storm: { lines: ['     .-.    ', '    (   ).  ', '   (___(__) ', '    ⚡‚‚⚡‚‚  ', '   ‚‚⚡‚‚⚡   '], colors: ['dark', 'dark', 'dark', 'bolt', 'bolt'] },
  };
  const art = $derived(ART[kindOf(data.current.code)]);
  const cmd = $derived(`weather "${data.place}"`);
</script>

<div class="term">
  <div class="bar"><i></i><i></i><i></i><span>~/weather</span></div>
  <div class="body">
    <div class="prompt"><span class="user">you@notion</span>:<span class="path">~</span>$ {cmd}</div>
    <div class="now">
      <pre class="art">{#each art.lines as line, i (i)}<span class={art.colors[i]}>{line}</span>
{/each}</pre>
      <div class="info">
        <span class="desc">{describe(data.current.code, opts.lang)}</span>
        <span><b class="hot">{deg(data.current.temp)}C</b> <span class="dim">({t.feels.toLowerCase()} {deg(data.current.feels)})</span></span>
        <span>{windText(data.current.wind, opts)} <span class="dim">{compass(data.current.windDir, pt)}</span></span>
        <span>{data.current.humidity}% <span class="dim">{t.humidity.toLowerCase()}</span></span>
        {#if opts.showRegion && data.region}<span class="dim">{data.region}</span>{/if}
      </div>
    </div>
    <div class="table">
      {#each days as d, i (d.date)}
        <span class="dname">{dayName(d.date, i, opts.lang).padEnd(5, ' ')}</span>
        <span class="hot">{deg(d.max).padStart(4, ' ')}</span>
        <span class="cold">{deg(d.min).padStart(4, ' ')}</span>
        <span class="rain">{d.rain >= 30 ? `☂ ${d.rain}%` : ''}</span>
        <span class="dim">{describe(d.code, opts.lang).toLowerCase()}</span>
      {/each}
    </div>
    <div class="prompt"><span class="user">you@notion</span>:<span class="path">~</span>$ <span class="cursor" class:blink={opts.animate}>▋</span></div>
  </div>
</div>

<style>
  .term {
    width: 100%; max-width: 640px; border-radius: 10px; overflow: hidden;
    background: #0d1117; border: 1px solid #262c36; color: #c9d1d9;
    font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.45;
  }
  .bar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #161b22; border-bottom: 1px solid #262c36; }
  .bar i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
  .bar i:nth-child(2) { background: #febc2e; }
  .bar i:nth-child(3) { background: #28c840; }
  .bar span { margin-left: 8px; font-size: 11px; color: #8b949e; }
  .body { padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 6px; }
  .user { color: #7ee787; }
  .path { color: #79c0ff; }
  .now { display: flex; gap: 14px; align-items: center; }
  .art { margin: 0; font: inherit; line-height: 1.2; }
  .info { display: flex; flex-direction: column; }
  .desc { color: #e6edf3; font-weight: 700; }
  .table { display: grid; grid-template-columns: auto auto auto 64px 1fr; column-gap: 12px; white-space: pre; }
  .dname { color: #d2a8ff; }
  .hot { color: #ffa657; }
  .cold { color: #79c0ff; }
  .rain { color: #58a6ff; }
  .dim { color: #8b949e; }
  .sun { color: #f2cc60; }
  .cloud { color: #c9d1d9; }
  .dark { color: #8b949e; }
  .fog { color: #a5adb8; }
  .snow { color: #e6f0ff; }
  .bolt { color: #f2cc60; }
  .cursor { color: #7ee787; }
  .blink { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
