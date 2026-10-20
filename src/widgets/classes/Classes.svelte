<!-- Agora / próxima aula, a partir de uma grade escrita no link do embed.
     Visuais: card (agora + próxima + o resto do dia), week (grade da semana),
     terminal e minimal. Atualiza sozinho a cada 20 segundos. -->
<script lang="ts">
  import { getParam, getBool } from '../../shared/params';
  import { parseSchedule, currentSlot, upcoming, clock, span, DEMO, type Slot } from './schedule';

  const raw = getParam('classes', '').trim();
  const usingDemo = !raw || raw.toLowerCase() === 'demo';
  const slots = parseSchedule(usingDemo ? DEMO : raw);
  const style = getParam('style', 'card');
  const pt = getParam('lang', 'en-US') === 'pt-BR';
  const mono = getParam('accent', 'blue') === 'mono';
  const showRoom = getBool('room', true);
  const locale = pt ? 'pt-BR' : 'en-US';

  let now = $state(new Date());
  $effect(() => {
    const id = setInterval(() => (now = new Date()), 20_000);
    return () => clearInterval(id);
  });

  const cur = $derived(currentSlot(slots, now));
  const nexts = $derived(upcoming(slots, now, 6));
  const next = $derived(nexts[0] ?? null);
  const nowMin = $derived(now.getHours() * 60 + now.getMinutes());
  const todayLeft = $derived(nexts.filter((u) => u.daysAhead === 0));
  const curProgress = $derived(cur ? (nowMin - cur.start) / Math.max(1, cur.end - cur.start) : 0);

  /** Deixa a primeira letra maiúscula (pra frases que começam uma linha no cartão). */
  const cap = (text: string): string => (text ? text[0].toLocaleUpperCase(locale) + text.slice(1) : text);

  const T = pt
    ? { now: 'agora', next: 'próxima', free: 'livre', freeNow: 'Sem aula agora', freeUntil: 'livre até', endsIn: 'termina em', startsIn: 'começa em', today: 'ainda hoje', none: 'nenhuma aula na grade', doneToday: 'acabaram as aulas de hoje', tomorrow: 'amanhã', setup: 'Escreva sua grade no parâmetro classes (veja o README). Mostrando um exemplo.' }
    : { now: 'now', next: 'next', free: 'free', freeNow: 'No class now', freeUntil: 'free until', endsIn: 'ends in', startsIn: 'starts in', today: 'later today', none: 'no classes in the schedule', doneToday: 'no more classes today', tomorrow: 'tomorrow', setup: 'Write your timetable in the classes option (see README). Showing an example.' };

  // cor fixa por matéria (paleta do Notion; tons de cinza no modo mono)
  const PALETTE = ['#529cca', '#9a6dd7', '#4dab9a', '#ffa344', '#e255a1', '#ff7369', '#ffdc49', '#979a9b'];
  const GRAYS = ['#e6e6e6', '#b5b5b5', '#8a8a8a', '#666666'];
  const names = [...new Set(slots.map((s) => s.name))];
  /** Cor da matéria. */
  function color(name: string): string {
    const i = names.indexOf(name);
    return mono ? GRAYS[i % GRAYS.length] : PALETTE[i % PALETTE.length];
  }

  /** "seg", "amanhã" ou "hoje" pra uma aula futura. */
  function when(daysAhead: number, day: number): string {
    if (daysAhead === 0) return '';
    if (daysAhead === 1) return T.tomorrow;
    const d = new Date(2026, 0, 4 + day); // 4/jan/2026 é domingo
    return d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
  }

  // grade da semana: dias que têm aula (seg a sex sempre), faixa de horário coberta
  const weekDays = $derived([1, 2, 3, 4, 5, ...[6, 0].filter((d) => slots.some((s) => s.day === d))]);
  const dayStart = Math.floor(Math.min(...slots.map((s) => s.start), 8 * 60) / 60) * 60;
  const dayEnd = Math.ceil(Math.max(...slots.map((s) => s.end), 18 * 60) / 60) * 60;
  const hours = Array.from({ length: (dayEnd - dayStart) / 60 + 1 }, (_, i) => dayStart + i * 60);
  /** Posição vertical (%) de um horário na grade da semana. */
  function y(min: number): number {
    return ((min - dayStart) / (dayEnd - dayStart)) * 100;
  }
  /** Nome curto do dia da semana. */
  function dayName(d: number): string {
    return new Date(2026, 0, 4 + d).toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
  }
</script>

<main>
  {#if !slots.length}
    <p class="note">{T.none}</p>
  {:else if style === 'week'}
    <div class="week" style:--cols={weekDays.length}>
      <div class="hours">
        {#each hours as h (h)}<span style:top="{y(h)}%">{clock(h)}</span>{/each}
      </div>
      {#each weekDays as d (d)}
        <div class="day" class:today={d === now.getDay()}>
          <div class="dname">{dayName(d)}</div>
          <div class="lane">
            {#each hours as h (h)}<i class="hline" style:top="{y(h)}%"></i>{/each}
            {#each slots.filter((s) => s.day === d) as s (s.start + s.name)}
              <div
                class="block"
                class:live={cur === s}
                style:top="{y(s.start)}%"
                style:height="{y(s.end) - y(s.start)}%"
                style:--c={color(s.name)}
                title="{s.name} · {clock(s.start)}–{clock(s.end)}{s.room ? ` · ${s.room}` : ''}"
              >
                <b>{s.name}</b>
                {#if showRoom && s.room}<small>{s.room}</small>{/if}
              </div>
            {/each}
            {#if d === now.getDay() && nowMin >= dayStart && nowMin <= dayEnd}<i class="nowline" style:top="{y(nowMin)}%"></i>{/if}
          </div>
        </div>
      {/each}
    </div>
  {:else if style === 'terminal'}
    <div class="tw">
      <div class="tbar"><i></i><i></i><i></i><span>~/classes</span></div>
      <div class="tbody">
        <div><span class="u">you@unb</span>:<span class="p">~</span>$ schedule --now</div>
        {#if cur}
          <div><span class="ok">● {T.now}</span>  {cur.name}{showRoom && cur.room ? ` @ ${cur.room}` : ''}</div>
          <div class="dim">  [{'█'.repeat(Math.round(curProgress * 20))}{'░'.repeat(20 - Math.round(curProgress * 20))}] {T.endsIn} {span(cur.end - nowMin)}</div>
        {:else}
          <div><span class="dim">○ {next ? `${T.freeUntil} ${clock(next.slot.start)}${next.daysAhead ? ` (${when(next.daysAhead, next.slot.day)})` : ''}` : T.free}</span></div>
        {/if}
        {#each nexts.slice(0, 4) as u (u.slot.day + '-' + u.slot.start + u.slot.name)}
          <div><span class="k">{(when(u.daysAhead, u.slot.day) || clock(u.slot.start)).padEnd(6)}</span> {u.daysAhead ? clock(u.slot.start) + ' ' : ''}{u.slot.name}{showRoom && u.slot.room ? ` @ ${u.slot.room}` : ''} <span class="dim">· {span(u.startsIn)}</span></div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="card" class:minimal={style === 'minimal'}>
      <!-- agora -->
      <section class="nowbox" style:--c={cur ? color(cur.name) : 'var(--text-muted)'}>
        <span class="tag">{cur ? T.now : T.free}</span>
        {#if cur}
          <b class="title">{cur.name}</b>
          <span class="meta">{clock(cur.start)}–{clock(cur.end)}{showRoom && cur.room ? ` · ${cur.room}` : ''}</span>
          <div class="pbar"><i style:width="{curProgress * 100}%"></i></div>
          <span class="meta strong">{cap(T.endsIn)} {span(cur.end - nowMin)}</span>
        {:else if next}
          <b class="title">{T.freeNow}</b>
          <span class="meta">{todayLeft.length ? `${cap(T.freeUntil)} ${clock(next.slot.start)} · ${span(next.startsIn)}` : cap(T.doneToday)}</span>
        {:else}
          <b class="title">{cap(T.free)}</b>
        {/if}
      </section>

      {#if style !== 'minimal'}
        <!-- próxima + resto do dia -->
        <section class="list">
          {#if next}
            <div class="item first" style:--c={color(next.slot.name)}>
              <span class="tag">{T.next}</span>
              <b>{next.slot.name}</b>
              <span class="meta">{when(next.daysAhead, next.slot.day) ? `${cap(when(next.daysAhead, next.slot.day))} · ` : ''}{clock(next.slot.start)}{showRoom && next.slot.room ? ` · ${next.slot.room}` : ''}</span>
              <span class="meta strong">{cap(T.startsIn)} {span(next.startsIn)}</span>
            </div>
          {/if}
          {#each (todayLeft.length > 1 ? todayLeft.slice(1, 4) : []) as u (u.slot.start + u.slot.name)}
            <div class="item" style:--c={color(u.slot.name)}>
              <b>{u.slot.name}</b>
              <span class="meta">{clock(u.slot.start)}{showRoom && u.slot.room ? ` · ${u.slot.room}` : ''}</span>
            </div>
          {/each}
        </section>
      {/if}
    </div>
  {/if}
  {#if usingDemo}<p class="demo">{T.setup}</p>{/if}
</main>

<style>
  main { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; }
  .note, .demo { margin: 0; font-size: 11px; color: var(--text-muted); text-align: center; }
  .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c, var(--text-muted)); }
  .meta { font-size: 12px; color: var(--text-muted); }
  .meta.strong { color: var(--text); font-weight: 600; }

  /* card */
  .card { width: 100%; max-width: 640px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 12px; padding: 14px; border-radius: 14px; background: var(--bg-card); border: 1px solid var(--border); }
  .card.minimal { grid-template-columns: 1fr; max-width: 360px; }
  .nowbox { display: flex; flex-direction: column; gap: 4px; padding: 12px; border-radius: 10px; background: color-mix(in srgb, var(--c) 12%, transparent); border-left: 3px solid var(--c); }
  .title { font-size: 20px; line-height: 1.2; }
  .pbar { height: 6px; border-radius: 99px; background: color-mix(in srgb, var(--text) 10%, transparent); overflow: hidden; margin: 4px 0; }
  .pbar i { display: block; height: 100%; background: var(--c); border-radius: 99px; }
  .list { display: flex; flex-direction: column; gap: 6px; }
  .item { display: flex; flex-direction: column; gap: 1px; padding: 6px 10px; border-left: 3px solid var(--c); border-radius: 4px; }
  .item.first { background: color-mix(in srgb, var(--c) 8%, transparent); }
  .item b { font-size: 14px; }

  /* semana */
  .week { width: 100%; max-width: 900px; height: 100%; min-height: 260px; display: grid; grid-template-columns: 38px repeat(var(--cols), 1fr); gap: 4px; }
  .hours { position: relative; margin-top: 18px; }
  .hours span { position: absolute; right: 2px; transform: translateY(-50%); font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); }
  .day { display: flex; flex-direction: column; min-width: 0; }
  .dname { height: 18px; font-size: 11px; text-align: center; color: var(--text-muted); text-transform: capitalize; }
  .day.today .dname { color: var(--accent); font-weight: 700; }
  .lane { position: relative; flex: 1; border-radius: 6px; background: color-mix(in srgb, var(--text) 3%, transparent); }
  .day.today .lane { background: color-mix(in srgb, var(--accent) 6%, transparent); }
  .hline { position: absolute; left: 0; right: 0; border-top: 1px solid color-mix(in srgb, var(--text) 6%, transparent); }
  .block { position: absolute; left: 2px; right: 2px; padding: 3px 5px; border-radius: 5px; overflow: hidden; display: flex; flex-direction: column; background: color-mix(in srgb, var(--c) 22%, var(--bg-card)); border-left: 3px solid var(--c); }
  .block b { font-size: 10px; line-height: 1.2; }
  .block small { font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .block.live { box-shadow: 0 0 0 1.5px var(--c); }
  .nowline { position: absolute; left: -2px; right: -2px; border-top: 2px solid #ff7369; z-index: 2; }

  /* terminal */
  .tw { width: 100%; max-width: 560px; border-radius: 10px; overflow: hidden; background: #0d1117; border: 1px solid #262c36; color: #c9d1d9; font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.6; }
  .tbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #161b22; border-bottom: 1px solid #262c36; }
  .tbar i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
  .tbar i:nth-child(2) { background: #febc2e; }
  .tbar i:nth-child(3) { background: #28c840; }
  .tbar span { margin-left: 8px; font-size: 11px; color: #8b949e; }
  .tbody { padding: 8px 12px 10px; }
  .tbody div { white-space: pre-wrap; }
  .u, .ok { color: #7ee787; }
  .p { color: #79c0ff; }
  .k { color: #d2a8ff; }
  .dim { color: #6e7681; }

  @media (max-width: 520px) { .card { grid-template-columns: 1fr; } }
</style>
