<!-- Estatísticas de commits do último ano: sequência atual (com chama), recorde,
     total, dias ativos e um mini mapa das últimas semanas. -->
<script lang="ts">
  import { streaks } from '../api';
  import type { ContributionGrid } from '../../snake/contributions';
  import type { GitHubOptions } from '../options';

  let { grid, opts }: { grid: ContributionGrid; opts: GitHubOptions } = $props();
  const s = $derived(streaks(grid));
  const WEEKS = 18;
  // últimas semanas do grid, coluna por coluna
  const recent = $derived(grid.cells.filter((c) => c.x >= grid.cols - WEEKS));
  const firstCol = $derived(grid.cols - WEEKS);
  const L = $derived(
    opts.pt
      ? { cur: 'sequência atual', best: 'recorde', total: 'contribuições no ano', active: 'dias ativos', days: 'dias', bestDay: 'melhor dia' }
      : { cur: 'current streak', best: 'longest streak', total: 'contributions this year', active: 'active days', days: 'days', bestDay: 'best day' },
  );
</script>

<div class="stats">
  <div class="main">
    <span class="flame" class:off={s.current === 0}>🔥</span>
    <span class="big">{s.current}</span>
    <span class="label">{L.cur}</span>
  </div>
  <div class="side">
    <div><b>{s.longest}</b><span>{L.best} ({L.days})</span></div>
    <div><b>{s.total.toLocaleString(opts.pt ? 'pt-BR' : 'en-US')}</b><span>{L.total}</span></div>
    <div><b>{Math.round((s.activeDays / Math.max(1, grid.cells.length)) * 100)}%</b><span>{L.active}</span></div>
    {#if s.bestDay.count}<div><b>{s.bestDay.count}</b><span>{L.bestDay} · {s.bestDay.date.slice(8, 10)}/{s.bestDay.date.slice(5, 7)}</span></div>{/if}
  </div>
  <div class="map" style:--w={WEEKS}>
    {#each recent as c (c.date)}
      <i class="l{c.level}" style:grid-column={c.x - firstCol + 1} style:grid-row={c.y + 1} title="{c.date}: {c.count}"></i>
    {/each}
  </div>
</div>

<style>
  .stats { width: 100%; max-width: 640px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px; padding: 12px 16px; border-radius: 14px; background: var(--bg-card); border: 1px solid var(--border); }
  .main { display: flex; flex-direction: column; align-items: center; min-width: 96px; }
  .flame { font-size: 22px; filter: grayscale(0.2); }
  .flame.off { filter: grayscale(1); opacity: 0.4; }
  .big { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
  .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }
  .side { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
  .side div { display: flex; flex-direction: column; }
  .side b { font-size: 16px; }
  .side span { font-size: 10px; color: var(--text-muted); }
  .map { display: grid; grid-template-columns: repeat(var(--w), 9px); grid-template-rows: repeat(7, 9px); gap: 2px; }
  .map i { border-radius: 2px; background: color-mix(in srgb, var(--text) 10%, transparent); }
  .map .l1 { background: color-mix(in srgb, var(--accent) 35%, transparent); }
  .map .l2 { background: color-mix(in srgb, var(--accent) 55%, transparent); }
  .map .l3 { background: color-mix(in srgb, var(--accent) 78%, transparent); }
  .map .l4 { background: var(--accent); }
  @media (max-width: 520px) { .map { display: none; } .stats { grid-template-columns: auto 1fr; } }
</style>
