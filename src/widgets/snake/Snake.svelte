<!-- Cobrinha do GitHub.
     source=live (padrão): busca as contribuições do ?user= e anima no navegador.
     source=generated: mostra o SVG gerado no deploy (Platane/snk) pro dono do repo. -->
<script lang="ts">
  import { getParam, getBool } from '../../shared/params';
  import { PUBLIC_BASE } from '../../shared/registry';
  import { fetchGrid, type ContributionGrid } from './contributions';
  import { planSnake, type SnakePlan } from './solver';
  import { buildColors, SNAKE_LOOKS, BAR_SHAPES, type SnakeLook, type BarShape } from './colors';
  import SnakeCanvas from './SnakeCanvas.svelte';

  const theme = getParam('theme', 'dark') === 'light' ? 'light' : 'dark';
  const accentName = getParam('accent', 'blue');
  const dots = getParam('dots', 'accent') === 'github' ? 'github' : 'accent';
  const source = getParam('source', 'live');
  // dono do site no GitHub Pages (ex.: "the-jonas" em the-jonas.github.io)
  const owner = new URL(PUBLIC_BASE).hostname.split('.')[0].toLowerCase();
  const user = getParam('user', '').trim().replace(/^@/, '');
  const showStats = getBool('stats', true);
  const pt = getParam('lang', 'en-US') === 'pt-BR';
  const STEP_MS: Record<string, number> = { slow: 150, normal: 100, fast: 60 };
  const stepMs = STEP_MS[getParam('speed', 'normal')] ?? 100;
  const lookParam = getParam('style', 'classic') as SnakeLook;
  const barParam = getParam('bar', 'smooth');
  const bar = barParam === 'steps' || barParam === 'none' ? barParam : 'smooth';
  const shapeParam = getParam('bar_shape', 'auto') as BarShape;
  const shape: BarShape = BAR_SHAPES.includes(shapeParam) ? shapeParam : 'auto';
  const look: SnakeLook = SNAKE_LOOKS.includes(lookParam) ? lookParam : 'classic';

  // cor de destaque já aplicada pelo tema (variável CSS --accent)
  const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#529cca';
  // cor da cobrinha: "auto" contrasta com os quadradinhos; senão uma cor do Notion
  const NOTION_COLORS: Record<string, string> = {
    blue: '#529cca', purple: '#9a6dd7', green: '#4dab9a', orange: '#ffa344',
    red: '#ff7369', pink: '#e255a1', yellow: '#ffdc49', gray: '#979a9b',
  };
  // cor própria em hex (ex.: ff6b6b ou #ff6b6b) tem prioridade sobre a lista
  const customHex = getParam('snake_hex', '').trim().replace(/^#/, '');
  const snakeColor = /^[0-9a-f]{6}$/i.test(customHex)
    ? `#${customHex}`
    : NOTION_COLORS[getParam('snake_color', 'auto')] ?? 'auto';
  const colors = buildColors(theme, accentHex, dots, snakeColor, accentName === 'mono');

  // ---- modo gerado no deploy ----
  const base = import.meta.env.DEV ? PUBLIC_BASE : import.meta.env.BASE_URL;
  const generatedSrc = `${base}snake/snake-${theme}-${accentName}-${dots}.svg`;
  let generatedFailed = $state(false);

  // ---- modo ao vivo ----
  let grid = $state<ContributionGrid | null>(null);
  let plan = $state<SnakePlan | null>(null);
  let error = $state('');
  // se o modo ao vivo falhar pro próprio dono, cai pro SVG gerado no deploy
  let useGenerated = $state(source === 'generated');

  if (source === 'live' && user) {
    fetchGrid(user)
      .then((g) => {
        grid = g;
        plan = planSnake(g);
      })
      .catch((e: Error) => {
        if (user.toLowerCase() === owner) useGenerated = true;
        else error = e.message;
      });
  }

  /** Texto da linha de estatística, ex.: "1,234 contributions in the last year". */
  function statsText(total: number): string {
    const n = total.toLocaleString(pt ? 'pt-BR' : 'en-US');
    return pt ? `${n} contribuições no último ano` : `${n} contributions in the last year`;
  }
</script>

<main>
  {#if useGenerated}
    {#if generatedFailed}
      <p class="note">🐍 The snake is generated on deploy (once a day). Push to <code>main</code> or run the workflow and it will show up here.</p>
    {:else}
      <img src={generatedSrc} alt="GitHub contributions snake" onerror={() => (generatedFailed = true)} />
    {/if}
  {:else if !user}
    <p class="note">🐍 Set your GitHub username in the <code>user</code> option<br />(or <code>user=demo</code> to preview).</p>
  {:else if error}
    <p class="note">🐍 {error}</p>
  {:else if grid && plan}
    <div class="stage"><SnakeCanvas {grid} {plan} {colors} {stepMs} {look} {bar} {shape} /></div>
    {#if showStats}
      <a class="stats" href="https://github.com/{user}" target="_blank" rel="noreferrer">
        <span>{statsText(grid.total)}</span><span class="handle">@{user}</span>
      </a>
    {/if}
  {:else}
    <p class="note loading">Loading @{user}…</p>
  {/if}
</main>

<style>
  main { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; }
  .stage { flex: 1; width: 100%; min-height: 0; }
  img { width: 100%; height: 100%; object-fit: contain; }
  .stats {
    display: flex;
    gap: 8px;
    padding: 2px 0 4px;
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: none;
  }
  .stats:hover { color: var(--text); }
  .handle { color: var(--accent); font-weight: 600; }
  .note { max-width: 420px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.6; }
  .loading { animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 50% { opacity: 0.4; } }
  code { font-family: var(--font-mono); font-size: 12px; }
</style>
