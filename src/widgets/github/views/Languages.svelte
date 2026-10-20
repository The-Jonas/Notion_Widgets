<!-- Linguagens mais usadas do usuário, em seis visuais:
     compact (barra + legenda em 2 colunas), donut, bars, terminal, pie e chips.
     As linguagens escondidas saem da conta; depois do top N, o resto vira "Other". -->
<script lang="ts">
  import type { LangSummary } from '../api';
  import type { GitHubOptions } from '../options';
  import { langColor } from '../langs';

  let { summary, opts }: { summary: LangSummary; opts: GitHubOptions } = $props();

  interface Slice { name: string; share: number; repos: number; color: string }

  /** Tira as escondidas, recalcula as porcentagens e junta o que passa do top N em "Other". */
  function slices(): Slice[] {
    const visible = summary.langs.filter((l) => !opts.hide.includes(l.name.toLowerCase()));
    const total = visible.reduce((a, l) => a + l.bytes, 0) || 1;
    const top = visible.slice(0, opts.top).map((l) => ({ name: l.name, share: l.bytes / total, repos: l.repos }));
    const rest = visible.slice(opts.top);
    if (rest.length) {
      top.push({
        name: opts.pt ? 'Outras' : 'Other',
        share: rest.reduce((a, l) => a + l.bytes, 0) / total,
        repos: rest.length,
      });
    }
    return top.map((l, i) => ({ ...l, color: langColor(l.name === 'Outras' ? 'Other' : l.name, opts.mono, i, opts.light) }));
  }

  const list = $derived(slices());
  const max = $derived(Math.max(...list.map((l) => l.share), 0.0001));
  const title = $derived(opts.title === '-' ? '' : opts.title || (opts.pt ? 'Linguagens mais usadas' : 'Most Used Languages'));
  const locale = $derived(opts.pt ? 'pt-BR' : 'en-US');
  const caption = $derived(
    `${opts.pt ? (summary.by === 'bytes' ? 'por bytes de código' : 'por repositório') : summary.by === 'bytes' ? 'by bytes of code' : 'by repository'}` +
      ` · ${summary.repos} repos${summary.partial ? (opts.pt ? ' · parcial (limite da API)' : ' · partial (API limit)') : ''}`,
  );

  /** Porcentagem com casas decimais no formato do idioma. */
  function pct(share: number, digits = 2): string {
    return `${(share * 100).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
  }

  // ---------- donut: arcos com stroke-dasharray ----------
  const R = 40;
  const C = 2 * Math.PI * R;
  const arcs = $derived.by(() => {
    let acc = 0;
    const gap = list.length > 1 ? 1.2 : 0;
    return list.map((l) => {
      const len = Math.max(0, l.share * C - gap);
      const a = { ...l, dash: `${len} ${C - len}`, offset: -acc };
      acc += l.share * C;
      return a;
    });
  });

  // ---------- pie: fatias com path ----------
  /** Caminho SVG de uma fatia do ângulo a0 ao a1 (em voltas, 0..1). */
  function slicePath(a0: number, a1: number): string {
    if (a1 - a0 >= 0.9999) return 'M 50 4 A 46 46 0 1 1 49.99 4 Z';
    const p = (a: number) => [50 + 46 * Math.sin(a * 2 * Math.PI), 50 - 46 * Math.cos(a * 2 * Math.PI)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M 50 50 L ${x0.toFixed(2)} ${y0.toFixed(2)} A 46 46 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
  }
  const pies = $derived.by(() => {
    let acc = 0;
    return list.map((l) => {
      const s = { ...l, d: slicePath(acc, acc + l.share) };
      acc += l.share;
      return s;
    });
  });

  // ---------- terminal: barra ASCII ----------
  const WIDTH = 18;
  const nameWidth = $derived(Math.max(...list.map((l) => l.name.length), 6));
  /** Barra de blocos proporcional à maior linguagem. */
  function ascii(share: number): { full: string; empty: string } {
    const n = Math.max(share > 0 ? 1 : 0, Math.round((share / max) * WIDTH));
    return { full: '█'.repeat(n), empty: '░'.repeat(WIDTH - n) };
  }
</script>

{#if !list.length}
  <p class="empty">{opts.pt ? 'Nenhuma linguagem encontrada.' : 'No languages found.'}</p>
{:else if opts.layout === 'terminal'}
  <div class="term">
    <div class="tbar"><i></i><i></i><i></i><span>~/langs</span></div>
    <div class="tbody">
      <div><span class="user">you@notion</span>:<span class="path">~</span>$ gh langs --user {opts.user} --top {opts.top}</div>
      {#each list as l (l.name)}
        {@const b = ascii(l.share)}
        <div class="trow">
          <span class="tname">{l.name.padEnd(nameWidth, ' ')}</span>
          <span><span style:color={l.color}>{b.full}</span><span class="tempty">{b.empty}</span></span>
          <span class="tpct">{pct(l.share).padStart(7, ' ')}</span>
        </div>
      {/each}
      <div class="tdim"># {caption}</div>
    </div>
  </div>
{:else}
  <div class="card">
    {#if title}<h2>{title}</h2>{/if}

    {#if opts.layout === 'compact'}
      <div class="bar">
        {#each list as l (l.name)}<span style:width="{l.share * 100}%" style:background={l.color}></span>{/each}
      </div>
      <div class="legend two">
        {#each list as l (l.name)}
          <span><i style:background={l.color}></i>{l.name} <small>{pct(l.share)}</small></span>
        {/each}
      </div>
    {:else if opts.layout === 'donut'}
      <div class="split">
        <svg viewBox="0 0 100 100" class="ring">
          <circle cx="50" cy="50" r={R} class="track" />
          {#each arcs as a (a.name)}
            <circle cx="50" cy="50" r={R} stroke={a.color} stroke-dasharray={a.dash} stroke-dashoffset={a.offset} transform="rotate(-90 50 50)" />
          {/each}
          <text x="50" y="49" class="big">{pct(list[0].share, 0)}</text>
          <text x="50" y="62" class="small">{list[0].name.length > 12 ? `${list[0].name.slice(0, 11)}…` : list[0].name}</text>
        </svg>
        <div class="legend">
          {#each list as l (l.name)}
            <span><i style:background={l.color}></i>{l.name}<small>{pct(l.share, 1)}</small></span>
          {/each}
        </div>
      </div>
      <p class="caption">{caption}</p>
    {:else if opts.layout === 'bars'}
      <div class="rows">
        {#each list as l (l.name)}
          <div class="row">
            <div class="label"><span><i style:background={l.color}></i>{l.name}</span><small>{pct(l.share, 1)}</small></div>
            <div class="track-line"><span style:width="{(l.share / max) * 100}%" style:background={l.color}></span></div>
          </div>
        {/each}
      </div>
      <p class="caption">{caption}</p>
    {:else if opts.layout === 'pie'}
      <div class="split">
        <svg viewBox="0 0 100 100" class="piechart">
          {#each pies as s (s.name)}<path d={s.d} fill={s.color} />{/each}
        </svg>
        <div class="legend">
          {#each list as l (l.name)}
            <span><i style:background={l.color}></i>{l.name}<small>{pct(l.share, 1)}</small></span>
          {/each}
        </div>
      </div>
    {:else}
      <div class="chips">
        {#each list as l (l.name)}
          <span class="chip" style:--c={l.color}><i></i>{l.name}<b>{pct(l.share, 1)}</b></span>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .empty { font-size: 13px; color: var(--text-muted); }
  .card {
    width: 100%; max-width: 460px; padding: 14px 18px 16px; border-radius: 10px;
    background: var(--bg-card); border: 1px solid var(--border);
  }
  h2 { margin: 0 0 12px; font-size: 18px; font-weight: 600; color: var(--accent); letter-spacing: -0.01em; }
  i { display: inline-block; flex: none; width: 10px; height: 10px; border-radius: 50%; }
  small { color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .caption { margin: 10px 0 0; font-size: 10px; color: var(--text-muted); }

  /* compact */
  .bar { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--bg-hover); }
  .bar span { height: 100%; }
  .bar span + span { box-shadow: inset 1.5px 0 0 var(--bg-card); }
  .legend { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
  .legend span { display: flex; align-items: center; gap: 7px; min-width: 0; }
  .legend.two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-top: 14px; }
  .legend.two span { white-space: nowrap; }

  /* donut e pie: gráfico à esquerda, legenda à direita */
  .split { display: flex; align-items: center; gap: 20px; }
  .split .legend { flex: 1; }
  .split .legend span { white-space: nowrap; overflow: hidden; }
  .split .legend small { margin-left: auto; padding-left: 10px; }
  .ring, .piechart { width: 112px; height: 112px; flex: none; }
  .ring circle { fill: none; stroke-width: 13; }
  .ring .track { stroke: var(--bg-hover); }
  .ring text { text-anchor: middle; fill: var(--text); }
  .ring .big { font-size: 17px; font-weight: 700; }
  .ring .small { font-size: 8.5px; fill: var(--text-muted); }
  .piechart path { stroke: var(--bg-card); stroke-width: 1; }

  /* bars */
  .rows { display: flex; flex-direction: column; gap: 7px; }
  .label { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 3px; }
  .label span { display: flex; align-items: center; gap: 7px; }
  .track-line { height: 6px; border-radius: 99px; background: var(--bg-hover); overflow: hidden; }
  .track-line span { display: block; height: 100%; border-radius: 99px; }

  /* chips */
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px; font-size: 12px;
    border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
    background: color-mix(in srgb, var(--c) 12%, transparent);
  }
  .chip i { width: 8px; height: 8px; background: var(--c); }
  .chip b { font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }

  /* terminal (mesmo visual do pomodoro e do clima terminal) */
  .term {
    width: 100%; max-width: 520px; border-radius: 10px; overflow: hidden;
    background: #0d1117; border: 1px solid #262c36; color: #c9d1d9;
    font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.55;
  }
  .tbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #161b22; border-bottom: 1px solid #262c36; }
  .tbar i { width: 10px; height: 10px; background: #ff5f57; }
  .tbar i:nth-child(2) { background: #febc2e; }
  .tbar i:nth-child(3) { background: #28c840; }
  .tbar span { margin-left: 8px; font-size: 11px; color: #8b949e; }
  .tbody { padding: 8px 12px 10px; overflow-x: auto; }
  .trow, .tdim { white-space: pre; }
  .user { color: #7ee787; }
  .path { color: #79c0ff; }
  .trow { display: flex; gap: 10px; }
  .tempty { color: #30363d; }
  .tpct { color: #8b949e; }
  .tdim { color: #6e7681; margin-top: 4px; }

  /* tema claro */
  :global([data-theme='light']) .bar span + span { box-shadow: inset 1.5px 0 0 var(--bg-card); }
  @media (max-width: 380px) { .legend.two { grid-template-columns: 1fr; } .split { flex-direction: column; } }
</style>
