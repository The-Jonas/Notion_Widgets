<!-- Treino de digitação com 10 dedos: texto pra digitar, teclado na tela com o dedo
     certo de cada tecla, lições por fileira, resultado (WPM e precisão), histórico
     e as teclas em que você mais erra. Tab ou Esc recomeça.
     Também conta quanto tempo você digitou hoje, pra bater a meta diária (daily). -->
<script lang="ts">
  import { getParam, getNumber, getBool } from '../../shared/params';
  import { buildText, LESSONS } from './words';
  import { LAYOUTS, FINGER_NAMES, FINGER_COLORS, findKey, type Key } from './keyboard';
  import { onMount } from 'svelte';
  import { loadRuns, saveRun, loadMisses, addMisses, clearHistory, loadPracticeToday, addPractice, PRACTICE_KEY, type Run } from './history';

  // ---------- opções da URL ----------
  const pt = getParam('lang', 'en-US') === 'pt-BR';
  const wordsLang = getParam('words', pt ? 'pt' : 'en');
  const accents = getBool('accents', false);
  const layoutName = getParam('layout', pt ? 'abnt2' : 'qwerty') === 'abnt2' ? 'abnt2' : 'qwerty';
  const showKeyboard = getBool('keyboard', true);
  const goal = Math.max(5, getNumber('goal', 40));
  const style = getParam('style', 'clean');
  const daily = Math.max(0, getNumber('daily', 15)); // meta de prática por dia, em minutos (0 esconde)
  const layout = LAYOUTS[layoutName];

  const MODES = ['words', 'home', 'top', 'bottom', 'numbers'];
  const LIMITS = ['10w', '25w', '50w', '15s', '30s', '60s'];
  let mode = $state(MODES.includes(getParam('mode', 'words')) ? getParam('mode', 'words') : 'words');
  let limit = $state(LIMITS.includes(getParam('limit', '25w')) ? getParam('limit', '25w') : '25w');

  const timed = $derived(limit.endsWith('s'));
  const amount = $derived(parseInt(limit, 10));

  const T = pt
    ? { start: 'clique aqui e comece a digitar', restart: 'Tab ou Esc recomeça', wpm: 'ppm', acc: 'precisão', time: 'tempo', best: 'recorde', avg: 'média (10)', today: 'hoje', tests: 'testes', weak: 'teclas que mais erra', again: '↻ de novo', next: 'próxima lição →', goal: 'meta', practice: 'prática hoje', done: 'meta do dia batida', reset: 'zerar histórico', words: 'palavras', none: 'nada ainda', space: 'espaço', shift: 'shift', then: 'depois' }
    : { start: 'click here and start typing', restart: 'Tab or Esc to restart', wpm: 'wpm', acc: 'accuracy', time: 'time', best: 'best', avg: 'avg (10)', today: 'today', tests: 'tests', weak: 'keys you miss most', again: '↻ again', next: 'next lesson →', goal: 'goal', practice: 'practice today', done: 'daily goal done', reset: 'reset history', words: 'words', none: 'nothing yet', space: 'space', shift: 'shift', then: 'then' };

  const MODE_LABEL: Record<string, string> = {
    words: pt ? 'palavras' : 'words',
    home: pt ? LESSONS.home.labelPt : LESSONS.home.label,
    top: pt ? LESSONS.top.labelPt : LESSONS.top.label,
    bottom: pt ? LESSONS.bottom.labelPt : LESSONS.bottom.label,
    numbers: pt ? LESSONS.numbers.labelPt : LESSONS.numbers.label,
  };

  // ---------- estado do teste ----------
  let text = $state('');
  let typed = $state('');
  let startedAt = $state(0);
  let now = $state(Date.now());
  let finished = $state(false);
  let endAt = $state(0);
  let keystrokes = 0;
  let misses: Record<string, number> = {};
  let focused = $state(false);
  let runs = $state<Run[]>(loadRuns());
  let missMap = $state<Record<string, number>>(loadMisses());
  let input = $state<HTMLInputElement>();
  let textBox = $state<HTMLDivElement>();
  let timer: ReturnType<typeof setInterval> | undefined;

  // ---------- tempo de prática do dia ----------
  // conta só o tempo digitando de verdade: pausas maiores que IDLE_MS não entram
  const IDLE_MS = 5000;
  let practiceMs = $state(loadPracticeToday());
  let lastKeyAt = 0;
  let pendingMs = 0;

  /** Grava o tempo acumulado no navegador. */
  function flushPractice() {
    if (pendingMs <= 0) return;
    practiceMs = addPractice(pendingMs);
    pendingMs = 0;
  }

  /** Conta o intervalo desde a última tecla, se você não parou. */
  function countPractice() {
    const t = Date.now();
    const gap = t - lastKeyAt;
    lastKeyAt = t;
    if (gap > IDLE_MS) return;
    pendingMs += gap;
    practiceMs += gap; // mostra na hora; grava de tempos em tempos
    if (pendingMs > 3000) {
      const shown = practiceMs;
      flushPractice();
      practiceMs = Math.max(practiceMs, shown);
    }
  }

  // outro embed (ou a virada do dia) mudou o total: relê
  onMount(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PRACTICE_KEY) practiceMs = loadPracticeToday() + pendingMs;
    };
    const tick = setInterval(() => (practiceMs = loadPracticeToday() + pendingMs), 60000);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', flushPractice);
    return () => {
      flushPractice();
      clearInterval(tick);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', flushPractice);
    };
  });

  const dailyMs = daily * 60000;
  const dailyDone = $derived(daily > 0 && practiceMs >= dailyMs);

  /** Formata ms como m:ss. */
  function mmss(ms: number): string {
    const sec = Math.floor(ms / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  }

  /** Gera um texto novo e zera o teste. */
  function reset() {
    const count = timed ? 120 : amount;
    text = buildText(mode, wordsLang, count, accents, layoutName).join(' ');
    typed = '';
    startedAt = 0;
    finished = false;
    keystrokes = 0;
    misses = {};
    clearInterval(timer);
    textBox?.scrollTo({ top: 0 });
    input?.focus();
  }
  reset();

  // contas ao vivo
  const correct = $derived([...typed].filter((ch, i) => ch === text[i]).length);
  const elapsed = $derived(startedAt ? Math.max(1, (finished ? endAt : now) - startedAt) : 0);
  const wpm = $derived(elapsed ? Math.round(correct / 5 / (elapsed / 60000)) : 0);
  const acc = $derived(typed.length ? Math.round((correct / Math.max(1, keystrokes)) * 100) : 100);
  const timeLeft = $derived(timed ? Math.max(0, amount - Math.floor(elapsed / 1000)) : 0);
  const progress = $derived(timed ? (amount * 1000 - Math.max(0, amount * 1000 - elapsed)) / (amount * 1000) : typed.length / Math.max(1, text.length));

  // próxima tecla (pro teclado e a dica de dedo)
  const nextChar = $derived(finished ? '' : (text[typed.length] ?? ''));
  const hit = $derived(nextChar ? findKey(layout, nextChar) : null);
  const fingerHint = $derived.by(() => {
    if (!hit) return '';
    const idx = pt ? 1 : 0;
    if (!hit.key) return `${T.space} · ${FINGER_NAMES.th[idx]}`;
    const f = FINGER_NAMES[hit.key.finger][idx];
    const parts = [];
    if (hit.dead) parts.push(`${hit.dead} ${T.then}`);
    if (hit.shift) parts.push(`${T.shift} +`);
    parts.push(`${hit.key.base.toUpperCase()} · ${f}`);
    return parts.join(' ');
  });

  /** O shift fica do lado oposto da mão que aperta a tecla. */
  const shiftSide = $derived(hit?.shift && hit.key ? (hit.key.finger.startsWith('l') ? 'right' : 'left') : '');

  /** Processa um caractere digitado. */
  function type(ch: string) {
    if (finished) return;
    if (!startedAt) {
      startedAt = Date.now();
      now = startedAt;
      timer = setInterval(() => {
        now = Date.now();
        if (timed && now - startedAt >= amount * 1000) finish();
      }, 200);
    }
    countPractice();
    const expected = text[typed.length];
    keystrokes++;
    if (ch !== expected && expected !== undefined) misses[expected] = (misses[expected] ?? 0) + 1;
    typed += ch;
    // modo tempo: estica o texto se estiver acabando
    if (timed && text.length - typed.length < 60) text += ' ' + buildText(mode, wordsLang, 40, accents, layoutName).join(' ');
    if (!timed && typed.length >= text.length) finish();
    keepCaretVisible();
  }

  /** Termina o teste e guarda no histórico. */
  function finish() {
    if (finished) return;
    endAt = Date.now();
    now = endAt;
    finished = true;
    clearInterval(timer);
    flushPractice();
    if (typed.length >= 5) {
      runs = saveRun({ t: endAt, wpm, acc, mode: `${mode}·${limit}` });
      missMap = addMisses(misses);
    }
  }

  /** Lê o que entrou no campo escondido (funciona com acentos e celular). */
  function onInput(e: Event) {
    const el = e.target as HTMLInputElement;
    if ((e as InputEvent).isComposing) return;
    const value = el.value;
    el.value = '';
    for (const ch of value) type(ch);
  }

  /** Teclas de controle: Backspace apaga, Tab/Esc recomeçam, Enter no fim recomeça. */
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Tab' || e.key === 'Escape' || (finished && e.key === 'Enter')) {
      e.preventDefault();
      reset();
    } else if (e.key === 'Backspace' && !finished) {
      e.preventDefault();
      typed = e.ctrlKey || e.altKey ? typed.replace(/\S*\s?$/, '') : typed.slice(0, -1);
    }
  }

  /** Rola o texto pra manter o cursor na linha do meio. */
  function keepCaretVisible() {
    requestAnimationFrame(() => {
      const caret = textBox?.querySelector('.caret') as HTMLElement | null;
      if (!caret || !textBox) return;
      const line = caret.offsetTop;
      if (line - textBox.scrollTop > 40) textBox.scrollTo({ top: line - 34, behavior: 'smooth' });
    });
  }

  /** Muda modo/limite e recomeça. */
  function pick(kind: 'mode' | 'limit', value: string) {
    if (kind === 'mode') mode = value;
    else limit = value;
    reset();
  }

  /** Próxima lição na ordem home → top → bottom → numbers → words. */
  function nextLesson() {
    pick('mode', MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }

  // estatísticas do histórico
  const best = $derived(runs.reduce((b, r) => Math.max(b, r.wpm), 0));
  const avg10 = $derived(runs.length ? Math.round(runs.slice(-10).reduce((a, r) => a + r.wpm, 0) / Math.min(10, runs.length)) : 0);
  const todayRuns = $derived(runs.filter((r) => new Date(r.t).toDateString() === new Date().toDateString()).length);
  const recent = $derived(runs.slice(-20));
  const sparkMax = $derived(Math.max(goal, ...recent.map((r) => r.wpm), 1));
  const weakKeys = $derived(
    Object.entries(missMap)
      .filter(([k]) => k.trim())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  );

  /** Classe de cada letra do texto. */
  function letterClass(i: number): string {
    if (i >= typed.length) return i === typed.length && !finished ? 'caret' : '';
    return typed[i] === text[i] ? 'ok' : text[i] === ' ' ? 'bad space' : 'bad';
  }

  /** Cor de dedo de uma tecla (mais forte se for a próxima). */
  function keyStyle(k: Key): string {
    return `--f:${FINGER_COLORS[k.finger]}`;
  }
</script>

<main class={style}>
  <div class="wrap">
    <!-- barra de modos -->
    <div class="bar">
      <div class="group">
        {#each MODES as m (m)}<button class:on={mode === m} onclick={() => pick('mode', m)}>{MODE_LABEL[m]}</button>{/each}
      </div>
      <div class="group">
        {#each LIMITS as l (l)}<button class:on={limit === l} onclick={() => pick('limit', l)}>{l}</button>{/each}
      </div>
    </div>

    {#if !finished}
      <!-- linha ao vivo -->
      <div class="live">
        <span class="big">{timed ? `${timeLeft}s` : `${typed.split(' ').length - (typed ? 0 : 1)}/${amount}`}</span>
        <span>{wpm} {T.wpm}</span>
        <span>{acc}%</span>
        <span class="hint" style:--f={hit?.key ? FINGER_COLORS[hit.key.finger] : FINGER_COLORS.th}>{fingerHint}</span>
      </div>
      <div class="progress"><i style:width="{Math.min(1, progress) * 100}%"></i></div>

      <!-- texto -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="text" class:blur={!focused} bind:this={textBox} onclick={() => input?.focus()}>
        {#each text as ch, i (i)}<span class={letterClass(i)}>{ch}</span>{/each}
      </div>
      {#if !focused}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="overlay" onclick={() => input?.focus()}>⌨ {T.start}</div>
      {/if}
    {:else}
      <!-- resultado -->
      <div class="result">
        <div class="score">
          <div><b class:goal={wpm >= goal}>{wpm}</b><span>{T.wpm}</span></div>
          <div><b>{acc}%</b><span>{T.acc}</span></div>
          <div><b>{Math.round(elapsed / 1000)}s</b><span>{T.time}</span></div>
          <div><b>{best}</b><span>{T.best}</span></div>
        </div>
        <div class="actions">
          <button class="main" onclick={reset}>{T.again}</button>
          {#if mode !== 'words'}<button onclick={nextLesson}>{T.next}</button>{/if}
          <span class="dim">{T.restart}</span>
        </div>
      </div>
    {/if}

    <input
      bind:this={input}
      class="sink"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="typing input"
      oninput={onInput}
      onkeydown={onKey}
      onfocus={() => (focused = true)}
      onblur={() => { focused = false; flushPractice(); }}
    />

    {#if showKeyboard && !finished}
      <div class="kb">
        {#each layout as r, ri (ri)}
          <div class="row" style:padding-left="{[0, 18, 26, 12][ri]}px">
            {#if ri === 3}<span class="key mod" class:next={shiftSide === 'left'}>⇧</span>{/if}
            {#each r as k (k.base)}
              <span class="key" class:next={hit?.key === k} class:home={ri === 2 && ['f', 'j'].includes(k.base)} style={keyStyle(k)}>{k.base.toUpperCase()}</span>
            {/each}
            {#if ri === 3}<span class="key mod" class:next={shiftSide === 'right'}>⇧</span>{/if}
          </div>
        {/each}
        <div class="row space"><span class="key spacebar" class:next={hit && !hit.key}>{T.space}</span></div>
      </div>
    {/if}

    <!-- histórico -->
    <div class="history">
      {#if daily > 0}
        <!-- meta diária de prática -->
        <div class="daily" class:done={dailyDone}>
          <span class="dlabel">{dailyDone ? `✓ ${T.done}` : `⏱ ${T.practice}`}</span>
          <div class="dbar"><i style:width="{Math.min(1, practiceMs / dailyMs) * 100}%"></i></div>
          <span class="dtime">{mmss(practiceMs)} / {daily}:00</span>
        </div>
      {/if}
      <div class="nums">
        <span><b>{best}</b> {T.best}</span>
        <span><b>{avg10}</b> {T.avg}</span>
        <span><b>{todayRuns}</b> {T.tests} {T.today}</span>
        <span class="dim">{T.goal} {goal} {T.wpm}</span>
      </div>
      <div class="spark" title="WPM">
        {#each recent as r (r.t)}<i class:hit={r.wpm >= goal} style:height="{(r.wpm / sparkMax) * 100}%" title="{r.wpm} {T.wpm} · {r.acc}%"></i>{/each}
        {#if !recent.length}<span class="dim">{T.none}</span>{/if}
      </div>
      {#if weakKeys.length}
        <div class="weak">
          <span class="dim">{T.weak}:</span>
          {#each weakKeys as [k, n] (k)}<span class="wk">{k === ' ' ? '␣' : k}<small>{n}</small></span>{/each}
          <button class="link" onclick={() => { clearHistory(); runs = []; missMap = {}; }}>{T.reset}</button>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  main { height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px 12px; }
  .wrap { position: relative; width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 10px; }
  button { all: unset; cursor: pointer; }

  .bar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; }
  .group { display: flex; gap: 2px; padding: 3px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); }
  .group button { padding: 2px 8px; border-radius: 6px; font-size: 11px; color: var(--text-muted); }
  .group button:hover { color: var(--text); }
  .group button.on { background: var(--bg-hover); color: var(--accent); font-weight: 600; }

  .live { display: flex; align-items: baseline; gap: 14px; font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
  .live .big { font-size: 20px; font-weight: 700; color: var(--accent); }
  .hint { margin-left: auto; font-size: 11px; padding: 1px 8px; border-radius: 99px; color: var(--text); background: color-mix(in srgb, var(--f) 22%, transparent); border: 1px solid color-mix(in srgb, var(--f) 50%, transparent); }
  .progress { height: 3px; border-radius: 99px; background: var(--bg-hover); overflow: hidden; }
  .progress i { display: block; height: 100%; background: var(--accent); transition: width 0.2s; }

  .text {
    position: relative; height: 102px; overflow: hidden; cursor: text;
    font-family: 'JetBrains Mono', var(--font-mono); font-size: 22px; line-height: 34px;
    color: color-mix(in srgb, var(--text) 38%, transparent); word-break: break-word;
    transition: filter 0.2s;
  }
  .text.blur { filter: blur(3px); }
  .text .ok { color: var(--text); }
  .text .bad { color: #ff7369; text-decoration: underline; text-decoration-thickness: 2px; }
  .text .bad.space { background: color-mix(in srgb, #ff7369 30%, transparent); }
  .text .caret { box-shadow: -2px 0 0 var(--accent); animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { box-shadow: -2px 0 0 transparent; } }
  .overlay { position: absolute; left: 0; right: 0; top: 70px; height: 102px; display: grid; place-items: center; font-size: 14px; color: var(--text); cursor: pointer; }
  .sink { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }

  .result { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
  .score { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .score div { display: flex; flex-direction: column; }
  .score b { font-size: 40px; line-height: 1; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .score b.goal { color: var(--accent); }
  .score span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .actions { display: flex; align-items: center; gap: 10px; }
  .actions button { padding: 4px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; }
  .actions button.main { background: var(--accent); border-color: var(--accent); color: var(--bg-page); font-weight: 700; }
  .dim { color: var(--text-muted); font-size: 11px; }

  /* teclado */
  .kb { display: flex; flex-direction: column; gap: 4px; align-items: center; user-select: none; }
  .row { display: flex; gap: 4px; }
  .key {
    width: 30px; height: 28px; display: grid; place-items: center; border-radius: 6px; font-size: 11px; font-family: var(--font-mono);
    color: var(--text-muted); background: color-mix(in srgb, var(--f, #979a9b) 10%, var(--bg-card));
    border: 1px solid color-mix(in srgb, var(--f, #979a9b) 28%, var(--border)); border-bottom-width: 2px;
    transition: transform 0.08s, background 0.08s;
  }
  .key.home { text-decoration: underline; text-underline-offset: 3px; }
  .key.mod { width: 44px; }
  .key.spacebar { width: 220px; }
  .key.next { background: var(--f, var(--accent)); color: #111; border-color: var(--f, var(--accent)); transform: translateY(-1px); font-weight: 700; }
  .key.mod.next, .key.spacebar.next { background: var(--accent); border-color: var(--accent); }

  /* meta diária */
  .daily { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-muted); }
  .dlabel { white-space: nowrap; }
  .dbar { flex: 1; height: 6px; border-radius: 99px; background: var(--bg-hover); overflow: hidden; }
  .dbar i { display: block; height: 100%; border-radius: 99px; background: color-mix(in srgb, var(--accent) 70%, transparent); transition: width 0.3s; }
  .dtime { font-family: var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .daily.done .dlabel, .daily.done .dtime { color: #4dab9a; font-weight: 600; }
  .daily.done .dbar i { background: #4dab9a; }

  /* histórico */
  .history { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; border-top: 1px solid var(--border); }
  .nums { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 12px; color: var(--text-muted); }
  .nums b { color: var(--text); font-size: 14px; }
  .spark { display: flex; align-items: flex-end; gap: 3px; height: 34px; }
  .spark i { flex: 1; max-width: 14px; min-height: 2px; border-radius: 3px 3px 1px 1px; background: color-mix(in srgb, var(--text) 25%, transparent); }
  .spark i.hit { background: var(--accent); }
  .weak { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; }
  .wk { font-family: var(--font-mono); padding: 1px 7px; border-radius: 6px; background: color-mix(in srgb, #ff7369 16%, transparent); border: 1px solid color-mix(in srgb, #ff7369 40%, transparent); }
  .wk small { margin-left: 4px; color: var(--text-muted); font-size: 10px; }
  .link { margin-left: auto; font-size: 11px; color: var(--text-muted); text-decoration: underline; }

  /* estilo terminal: tudo mono, fundo de terminal */
  main.terminal .wrap { padding: 12px 14px; border-radius: 10px; background: #0d1117; border: 1px solid #262c36; color: #c9d1d9; font-family: 'JetBrains Mono', var(--font-mono); --bg-card: #161b22; --bg-hover: #21262d; --border: #262c36; --text: #e6edf3; --text-muted: #8b949e; --bg-page: #0d1117; }

  @media (max-width: 560px) {
    .key { width: 22px; height: 24px; font-size: 9px; }
    .key.mod { width: 30px; }
    .key.spacebar { width: 150px; }
    .text { font-size: 17px; line-height: 28px; height: 84px; }
    .score b { font-size: 28px; }
  }
</style>
