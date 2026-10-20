<!-- Painel de um repositório, aberto por cima do widget ao clicar num card:
     descrição, tópicos, linguagens por bytes, últimos commits e o comando de clone
     (com botão de copiar). Navega com ‹ › e fecha com ✕, Esc ou clique fora. -->
<script lang="ts">
  import { fetchRepoDetails, ago, type Repo, type RepoDetails } from '../api';
  import type { GitHubOptions } from '../options';
  import LangBar from './LangBar.svelte';

  let { repos, index, opts, onclose, onnav }: {
    repos: Repo[];
    index: number;
    opts: GitHubOptions;
    onclose: () => void;
    onnav: (index: number) => void;
  } = $props();

  const repo = $derived(repos[index]);
  const clone = $derived(`git clone https://github.com/${repo.fullName}.git`);
  let details = $state<RepoDetails | null>(null);
  let failed = $state(false);
  let copied = $state(false);

  // busca os detalhes sempre que o repositório do painel muda
  $effect(() => {
    const name = repo.fullName;
    details = null;
    failed = false;
    fetchRepoDetails(name)
      .then((d) => { if (name === repo.fullName) details = d; })
      .catch(() => (failed = true));
  });

  /** Copia o comando de clone (com plano B pra iframes sem acesso ao clipboard). */
  async function copy() {
    try {
      await navigator.clipboard.writeText(clone);
    } catch {
      const area = document.createElement('textarea');
      area.value = clone;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  /** Fecha com Esc e navega com as setas do teclado. */
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    if (e.key === 'ArrowLeft' && index > 0) onnav(index - 1);
    if (e.key === 'ArrowRight' && index < repos.length - 1) onnav(index + 1);
  }
</script>

<svelte:window onkeydown={onkey} />

<div class="backdrop" role="presentation" onclick={onclose}>
  <div class="panel" role="dialog" aria-label={repo.name} tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
    <header>
      <button class="nav" disabled={index === 0} onclick={() => onnav(index - 1)} aria-label="Previous repo">‹</button>
      <div class="title">
        <b>{repo.name}</b>
        <span>★ {repo.stars} · ⑂ {repo.forks} · {opts.pt ? 'atualizado' : 'updated'} {ago(repo.pushedAt, opts.pt)}</span>
      </div>
      <button class="nav" disabled={index >= repos.length - 1} onclick={() => onnav(index + 1)} aria-label="Next repo">›</button>
      <button class="close" onclick={onclose} aria-label="Close">✕</button>
    </header>

    {#if repo.description}<p class="desc">{repo.description}</p>{/if}
    {#if repo.topics.length}<div class="topics">{#each repo.topics as tp (tp)}<span>{tp}</span>{/each}</div>{/if}

    {#if details}
      {#if details.languages.length}<LangBar langs={details.languages} mono={opts.mono} light={opts.light} />{/if}
      {#if details.commits.length}
        <ul class="commits">
          {#each details.commits as c (c.sha)}
            <li><code>{c.sha}</code><span class="msg">{c.message}</span><span class="when">{ago(c.date, opts.pt)}</span></li>
          {/each}
        </ul>
      {/if}
    {:else if failed}
      <p class="muted">{opts.pt ? 'Não deu pra carregar os detalhes agora.' : 'Could not load details right now.'}</p>
    {:else}
      <p class="muted loading">{opts.pt ? 'Carregando…' : 'Loading…'}</p>
    {/if}

    <footer>
      <button class="clone" onclick={copy} title="Copy">
        <code>$ {clone}</code><span>{copied ? (opts.pt ? '✓ copiado' : '✓ copied') : '⧉'}</span>
      </button>
      <a href={repo.url} target="_blank" rel="noreferrer">GitHub ↗</a>
    </footer>
  </div>
</div>

<style>
  .backdrop {
    position: fixed; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center;
    padding: 8px; background: rgb(0 0 0 / 0.5); animation: fade 0.15s ease-out;
  }
  .panel {
    width: 100%; max-width: 560px; max-height: 100%; overflow: auto;
    display: flex; flex-direction: column; gap: 8px; padding: 10px 14px;
    border-radius: 14px; background: #161616; border: 1px solid var(--border); color: var(--text);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.4); animation: pop 0.18s ease-out;
  }
  :global([data-theme='light']) .panel { background: #ffffff; }
  @keyframes fade { from { opacity: 0; } }
  @keyframes pop { from { transform: translateY(6px) scale(0.98); opacity: 0; } }
  header { display: flex; align-items: center; gap: 6px; }
  .title { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .title b { font-family: var(--font-mono); font-size: 14px; color: var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .title span { font-size: 11px; color: var(--text-muted); }
  button { all: unset; cursor: pointer; }
  .nav, .close { width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-size: 18px; color: var(--text-muted); }
  .close { font-size: 13px; }
  .nav:hover:not(:disabled), .close:hover { background: var(--bg-hover); color: var(--text); }
  .nav:disabled { opacity: 0.25; cursor: default; }
  .desc { margin: 0; font-size: 12px; line-height: 1.45; }
  .topics { display: flex; gap: 4px; flex-wrap: wrap; }
  .topics span { font-size: 10px; padding: 1px 7px; border-radius: 99px; border: 1px solid var(--border); color: var(--text-muted); }
  .commits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; font-size: 11px; }
  .commits li { display: flex; gap: 8px; align-items: baseline; }
  .commits code { font-family: var(--font-mono); color: var(--text-muted); }
  .msg { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .when { color: var(--text-muted); white-space: nowrap; }
  .muted { margin: 0; font-size: 12px; color: var(--text-muted); }
  .loading { animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 50% { opacity: 0.4; } }
  footer { display: flex; align-items: center; gap: 10px; }
  .clone {
    flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 6px 10px; border-radius: 8px; background: color-mix(in srgb, var(--text) 6%, transparent);
    font-size: 11px;
  }
  .clone code { font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .clone:hover { background: color-mix(in srgb, var(--text) 10%, transparent); }
  footer a { font-size: 11px; color: var(--text-muted); text-decoration: none; white-space: nowrap; }
</style>
