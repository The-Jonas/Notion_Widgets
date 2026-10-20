<!-- Mapa de foco: minutos de pomodoro por dia, lidos do histórico que o timer grava.
     Três visuais: grid (estilo GitHub), bars (últimos dias com linha de meta) e terminal. -->
<script lang="ts">
  import { getParam, getNumber, getBool } from '../../shared/params';
  import { readFocusLog, FOCUS_LOG_KEY, type FocusLog } from '../../shared/focusLog';
  import { buildGrid, lastDays, focusStats, hm, demoLog, levelFor } from './data';

  const style = getParam('style', 'grid');
  const weeks = Math.min(53, Math.max(4, Math.round(getNumber('weeks', 26))));
  const days = Math.min(60, Math.max(7, Math.round(getNumber('days', 14))));
  const goal = Math.max(5, getNumber('goal', 50));
  const showStats = getBool('stats', true);
  const pt = getParam('lang', 'en-US') === 'pt-BR';
  const demo = getBool('demo', false);

  let log = $state<FocusLog>(demo ? demoLog() : readFocusLog());

  /** Atualiza na hora quando um timer (em outro embed) termina um foco. */
  function onStorage(e: StorageEvent) {
    if (!demo && (e.key === FOCUS_LOG_KEY || e.key === 'nw-timer-stats')) log = readFocusLog();
  }

  const cells = $derived(buildGrid(log, weeks, goal));
  const stats = $derived(focusStats(log, cells));
  const recent = $derived(lastDays(log, days));
  const spark = $derived(lastDays(log, 30));
  const maxRecent = $derived(Math.max(goal, ...recent.map((d) => d.minutes)));
  const locale = pt ? 'pt-BR' : 'en-US';

  const T = pt
    ? { title: 'Mapa de foco', today: 'hoje', week: '7 dias', streak: 'sequência', best: 'melhor dia', total: 'no período', days: 'dias', goal: 'meta', empty: 'Termine um pomodoro e ele aparece aqui.', less: 'menos', more: 'mais' }
    : { title: 'Focus map', today: 'today', week: 'last 7 days', streak: 'streak', best: 'best day', total: 'in range', days: 'days', goal: 'goal', empty: 'Finish a pomodoro and it shows up here.', less: 'less', more: 'more' };

  // rótulos dos meses: na primeira coluna em que o mês muda
  const months = $derived(
    cells
      .filter((c) => c.row === 0)
      .map((c, i, arr) => {
        const m = c.date.slice(5, 7);
        const prev = i ? arr[i - 1].date.slice(5, 7) : '';
        return m !== prev ? { col: c.col, label: new Date(`${c.date}T12:00:00`).toLocaleDateString(locale, { month: 'short' }).replace('.', '') } : null;
      })
      .filter((x): x is { col: number; label: string } => !!x)
      // pula rótulos colados demais (mês que começa no fim da grade anterior)
      .filter((m, i, arr) => i === arr.length - 1 || arr[i + 1].col - m.col >= 3),
  );
  const weekdayLabels = pt ? ['seg', '', 'qua', '', 'sex', '', ''] : ['Mon', '', 'Wed', '', 'Fri', '', ''];

  /** Data curta pro tooltip e rótulos. */
  function short(date: string): string {
    return new Date(`${date}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'short' }).replace('.', '');
  }

  // terminal: barrinhas de bloco dos últimos 30 dias
  const BLOCKS = ' ▁▂▃▄▅▆▇█';
  const sparkline = $derived(
    spark.map((d) => BLOCKS[Math.min(8, Math.round((d.minutes / Math.max(goal, ...spark.map((x) => x.minutes), 1)) * 8))]).join(''),
  );
</script>

<svelte:window onstorage={onStorage} />

<main class:term={style === 'terminal'}>
  {#if style === 'terminal'}
    <div class="tw">
      <div class="tbar"><i></i><i></i><i></i><span>~/focus</span></div>
      <div class="tbody">
        <div><span class="u">you@notion</span>:<span class="p">~</span>$ focus --log --days 30</div>
        <div class="sparkbox">
          <div class="spark">{sparkline}</div>
          <div class="dates dim"><span>{short(spark[0].date)}</span><span>{short(spark[29].date)}</span></div>
        </div>
        <div><span class="k">{T.today.padEnd(12)}</span>{hm(stats.today)} <span class="dim">/ {T.goal} {hm(goal)}</span></div>
        <div><span class="k">{T.week.padEnd(12)}</span>{hm(stats.week)}</div>
        <div><span class="k">{T.streak.padEnd(12)}</span>{stats.streak} {T.days} {stats.streak >= 3 ? '🔥' : ''}</div>
        {#if stats.best.minutes}<div><span class="k">{T.best.padEnd(12)}</span>{hm(stats.best.minutes)} <span class="dim">({short(stats.best.date)})</span></div>{/if}
      </div>
    </div>
  {:else}
    <div class="card">
      {#if style === 'bars'}
        <div class="bars" style:--n={recent.length}>
          <div class="goal" style:bottom="{(goal / maxRecent) * 100}%"><span>{T.goal} {hm(goal)}</span></div>
          {#each recent as d (d.date)}
            <div class="col" title="{short(d.date)} · {hm(d.minutes)}">
              <div class="bar l{levelFor(d.minutes, goal)}" style:height="{(d.minutes / maxRecent) * 100}%"></div>
              <span>{new Date(`${d.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'narrow' })}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="gridwrap">
          <div class="months" style:--w={weeks}>
            {#each months as m (m.col)}<span style:grid-column={m.col + 1}>{m.label}</span>{/each}
          </div>
          <div class="body">
            <div class="wd">{#each weekdayLabels as w, i (i)}<span>{w}</span>{/each}</div>
            <div class="grid" style:--w={weeks}>
              {#each cells as c (c.date)}
                <i
                  class="l{c.level}"
                  class:future={c.future}
                  style:grid-column={c.col + 1}
                  style:grid-row={c.row + 1}
                  title="{short(c.date)} · {hm(c.minutes)}{c.sessions ? ` · ${c.sessions} 🍅` : ''}"
                ></i>
              {/each}
            </div>
          </div>
          <div class="legend">{T.less} <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> {T.more} · {T.goal} {hm(goal)}/{pt ? 'dia' : 'day'}</div>
        </div>
      {/if}

      {#if showStats}
        <div class="stats">
          <div><b>{hm(stats.today)}</b><span>{T.today}</span></div>
          <div><b>{hm(stats.week)}</b><span>{T.week}</span></div>
          <div><b>{stats.streak}{stats.streak >= 3 ? ' 🔥' : ''}</b><span>{T.streak} ({T.days})</span></div>
          <div><b>{hm(stats.total)}</b><span>{T.total}</span></div>
        </div>
      {/if}
      {#if !demo && stats.activeDays === 0}<p class="empty">{T.empty}</p>{/if}
    </div>
  {/if}
</main>

<style>
  main { height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px 12px; }
  .card { width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); }
  :global([data-bg='transparent']) .card { background: transparent; border-color: transparent; padding: 4px; }

  /* níveis de cor, do apagado ao accent cheio */
  .l0 { background: color-mix(in srgb, var(--text) 9%, transparent); }
  .l1 { background: color-mix(in srgb, var(--accent) 32%, transparent); }
  .l2 { background: color-mix(in srgb, var(--accent) 52%, transparent); }
  .l3 { background: color-mix(in srgb, var(--accent) 75%, transparent); }
  .l4 { background: var(--accent); }

  /* grid estilo GitHub */
  .gridwrap { display: flex; flex-direction: column; gap: 4px; overflow-x: auto; }
  .months { display: grid; grid-template-columns: repeat(var(--w), minmax(6px, 1fr)); gap: 3px; margin-left: 28px; font-size: 9px; color: var(--text-muted); height: 12px; max-width: calc(var(--w) * 17px); }
  .months span { white-space: nowrap; }
  .body { display: flex; gap: 4px; }
  .body .grid { flex: 1; max-width: calc(var(--w) * 17px); }
  .wd { display: grid; grid-template-rows: repeat(7, 1fr); gap: 3px; width: 24px; font-size: 9px; color: var(--text-muted); align-items: center; }
  .grid { display: grid; grid-template-columns: repeat(var(--w), minmax(6px, 1fr)); gap: 3px; }
  .grid i { border-radius: 2px; aspect-ratio: 1; }
  .grid i.future { visibility: hidden; }
  .legend { display: flex; align-items: center; gap: 3px; justify-content: flex-end; font-size: 10px; color: var(--text-muted); }
  .legend i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

  /* barras dos últimos dias */
  .bars { position: relative; display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 4px; height: 120px; align-items: end; padding-top: 4px; }
  .col { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 3px; }
  .col span { font-size: 9px; color: var(--text-muted); height: 11px; }
  .bar { width: 100%; max-width: 26px; min-height: 2px; border-radius: 4px 4px 2px 2px; }
  .goal { position: absolute; left: 0; right: 0; border-top: 1px dashed color-mix(in srgb, var(--text) 30%, transparent); margin-bottom: 14px; }
  .goal span { position: absolute; left: 0; top: -14px; font-size: 9px; color: var(--text-muted); }

  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .stats div { display: flex; flex-direction: column; }
  .stats b { font-size: 16px; font-variant-numeric: tabular-nums; }
  .stats span { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .empty { margin: 0; font-size: 12px; color: var(--text-muted); text-align: center; }

  /* terminal */
  .tw { width: 100%; max-width: 520px; border-radius: 10px; overflow: hidden; background: #0d1117; border: 1px solid #262c36; color: #c9d1d9; font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.55; }
  .tbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #161b22; border-bottom: 1px solid #262c36; }
  .tbar i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
  .tbar i:nth-child(2) { background: #febc2e; }
  .tbar i:nth-child(3) { background: #28c840; }
  .tbar span { margin-left: 8px; font-size: 11px; color: #8b949e; }
  .tbody { padding: 8px 12px 10px; }
  .tbody div { white-space: pre; }
  .u { color: #7ee787; }
  .p { color: #79c0ff; }
  .k { color: #8b949e; }
  .dim { color: #6e7681; }
  .sparkbox { display: inline-flex; flex-direction: column; margin-bottom: 4px; }
  .dates { display: flex; justify-content: space-between; }
  .spark { font-size: 20px; line-height: 1.1; color: var(--accent); letter-spacing: 1px; margin-top: 4px; }
  @media (max-width: 460px) { .stats { grid-template-columns: repeat(2, 1fr); } }
</style>
