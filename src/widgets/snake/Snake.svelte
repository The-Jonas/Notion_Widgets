<!-- Cobrinha do GitHub: mostra o SVG animado gerado todo dia pelo workflow
     de deploy (Platane/snk) a partir do gráfico de contribuições do dono do repo. -->
<script lang="ts">
  import { getParam } from '../../shared/params';
  import { PUBLIC_BASE } from '../../shared/registry';

  const theme = getParam('theme', 'dark') === 'light' ? 'light' : 'dark';
  const accent = getParam('accent', 'blue');
  const dots = getParam('dots', 'accent') === 'github' ? 'github' : 'accent';

  // no dev local os SVGs não existem (só são gerados no deploy),
  // então a Workbench busca a versão já publicada no GitHub Pages
  const base = import.meta.env.DEV ? PUBLIC_BASE : import.meta.env.BASE_URL;
  const src = `${base}snake/snake-${theme}-${accent}-${dots}.svg`;

  let failed = $state(false);
</script>

<main>
  {#if failed}
    <p class="missing">🐍 The snake is generated on deploy (once a day). Push to <code>main</code> or run the workflow and it will show up here.</p>
  {:else}
    <img {src} alt="GitHub contributions snake" onerror={() => (failed = true)} />
  {/if}
</main>

<style>
  main { height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; }
  img { width: 100%; height: 100%; object-fit: contain; }
  .missing { max-width: 420px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
  code { font-family: var(--font-mono); font-size: 12px; }
</style>
