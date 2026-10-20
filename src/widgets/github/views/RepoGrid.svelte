<!-- Cards de repositórios: os mais estrelados ou os atualizados por último (sem forks),
     ou um repositório só quando ?repo=dono/nome. -->
<script lang="ts">
  import { ago, type Repo } from '../api';
  import type { GitHubOptions } from '../options';
  import { langColor } from '../langs';

  let { repos, opts }: { repos: Repo[]; opts: GitHubOptions } = $props();
  const shown = $derived(
    repos
      .filter((r) => !r.fork || repos.length === 1)
      .sort((a, b) => (opts.sort === 'updated' ? b.pushedAt.localeCompare(a.pushedAt) : b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt)))
      .slice(0, repos.length === 1 ? 1 : opts.count),
  );
</script>

<!-- 4 repos viram 2x2; até 3 ficam numa linha; mais que 4, 3 por linha -->
<div class="grid" class:single={shown.length === 1} style:--cols={shown.length <= 3 ? shown.length : shown.length === 4 ? 2 : 3}>
  {#each shown as r, i (r.fullName)}
    <div class="repo">
      <div class="head">
        <span class="icon">⌸</span>
        <span class="name">{r.name}</span>
      </div>
      <p class="desc">{r.description || (opts.pt ? 'Sem descrição' : 'No description')}</p>
      {#if r.topics.length}
        <div class="topics">{#each r.topics.slice(0, 3) as t (t)}<span>{t}</span>{/each}</div>
      {/if}
      <div class="meta">
        {#if r.language}<span><i style:background={langColor(r.language, opts.mono, i, opts.light)}></i>{r.language}</span>{/if}
        <span>★ {r.stars}</span>
        <span>⑂ {r.forks}</span>
        <span class="when">{ago(r.pushedAt, opts.pt)}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .grid { width: 100%; display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 8px; }
  .grid.single { max-width: 420px; grid-template-columns: 1fr; }
  .repo {
    display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 12px;
    background: var(--bg-card); border: 1px solid var(--border); min-width: 0;
  }
  .head { display: flex; align-items: center; gap: 6px; }
  .icon { color: var(--text-muted); }
  .name { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .desc { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .topics { display: flex; gap: 4px; flex-wrap: wrap; }
  .topics span { font-size: 10px; padding: 1px 7px; border-radius: 99px; border: 1px solid var(--border); color: var(--text-muted); }
  .meta { display: flex; gap: 10px; white-space: nowrap; overflow: hidden; font-size: 11px; color: var(--text-muted); margin-top: auto; }
  .meta span { flex-shrink: 0; display: flex; align-items: center; gap: 4px; }
  .meta i { width: 9px; height: 9px; border-radius: 50%; }
  .when { margin-left: auto; flex-shrink: 1 !important; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 460px) { .grid { grid-template-columns: 1fr; } }
</style>
