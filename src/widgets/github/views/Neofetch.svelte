<!-- Perfil no estilo "neofetch": avatar à esquerda e as informações como saída de terminal. -->
<script lang="ts">
  import { topLanguages, ago, type Profile, type Repo } from '../api';
  import type { GitHubOptions } from '../options';
  import { langColor } from '../langs';

  let { profile, repos, opts }: { profile: Profile; repos: Repo[]; opts: GitHubOptions } = $props();
  const langs = $derived(topLanguages(repos, 3).filter((l) => l.name !== 'Other'));
  const stars = $derived(repos.filter((r) => !r.fork).reduce((a, r) => a + r.stars, 0));
  const last = $derived(repos.length ? ago(repos[0].pushedAt, opts.pt) : '-');
  const uptime = $derived(Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 864e5) * 10) / 10);
  const title = $derived(`${profile.login}@github`);
  // linhas "chave: valor"
  const rows = $derived([
    ['Name', profile.name],
    ['Location', profile.location || '-'],
    ['Repos', `${profile.publicRepos} (${stars} ★)`],
    ['Followers', `${profile.followers} · following ${profile.following}`],
    ['Uptime', `${uptime} ${opts.pt ? 'anos' : 'years'}`],
    ['Last push', last],
  ]);
  const BLOCKS = ['#1f1f1f', '#3a3a3a', '#5c5c5c', '#808080', '#a6a6a6', '#cccccc', '#f0f0f0'];
</script>

<div class="neo">
  {#if profile.avatar}
    <img src={profile.avatar} alt="" class="avatar" />
  {:else}
    <div class="avatar ph">{profile.name.charAt(0)}</div>
  {/if}
  <div class="info">
    <span class="title"><b>{profile.login}</b>@<b>github</b></span>
    <span class="rule">{'-'.repeat(title.length)}</span>
    {#each rows as [k, v] (k)}
      <span><b class="key">{k}</b>: {v}</span>
    {/each}
    <span>
      <b class="key">Langs</b>:
      {#each langs as l, i (l.name)}<span class="lang"><i style:background={langColor(l.name, opts.mono, i, opts.light)}></i>{l.name}</span>{/each}
    </span>
    <span class="blocks">{#each BLOCKS as c (c)}<i style:background={c}></i>{/each}</span>
  </div>
</div>

<style>
  .neo { display: flex; gap: 18px; align-items: center; font-family: 'JetBrains Mono', var(--font-mono); font-size: 12px; line-height: 1.55; }
  .avatar { width: 108px; height: 108px; border-radius: 10px; object-fit: cover; filter: grayscale(0.15); flex-shrink: 0; }
  .ph { display: grid; place-items: center; font-size: 40px; background: var(--bg-hover); }
  .info { display: flex; flex-direction: column; min-width: 0; }
  .title b { color: var(--accent); }
  .rule { color: var(--text-muted); }
  .key { color: var(--accent); }
  .lang { display: inline-flex; align-items: center; gap: 4px; margin-right: 8px; }
  .lang i { width: 8px; height: 8px; border-radius: 2px; }
  .blocks { display: flex; margin-top: 6px; }
  .blocks i { width: 18px; height: 12px; }
</style>
