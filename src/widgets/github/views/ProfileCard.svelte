<!-- Card de perfil: avatar, nome, bio, números e as linguagens mais usadas. -->
<script lang="ts">
  import { topLanguages, type Profile, type Repo } from '../api';
  import type { GitHubOptions } from '../options';
  import LangBar from './LangBar.svelte';

  let { profile, repos, opts }: { profile: Profile; repos: Repo[]; opts: GitHubOptions } = $props();
  const langs = $derived(topLanguages(repos));
  const stars = $derived(repos.filter((r) => !r.fork).reduce((a, r) => a + r.stars, 0));
  const since = $derived(new Date(profile.createdAt).getFullYear());
</script>

<div class="card">
  <div class="top">
    {#if profile.avatar}
      <img src={profile.avatar} alt="" class="avatar" />
    {:else}
      <div class="avatar ph">{profile.name.charAt(0)}</div>
    {/if}
    <div class="who">
      <span class="name">{profile.name}</span>
      <span class="login">@{profile.login}{profile.location ? ` · ${profile.location}` : ''}</span>
      {#if profile.bio}<span class="bio">{profile.bio}</span>{/if}
    </div>
  </div>
  <div class="nums">
    <span><b>{profile.publicRepos}</b>{opts.pt ? 'repos' : 'repos'}</span>
    <span><b>{stars}</b>{opts.pt ? 'estrelas' : 'stars'}</span>
    <span><b>{profile.followers}</b>{opts.pt ? 'seguidores' : 'followers'}</span>
    <span><b>{since}</b>{opts.pt ? 'desde' : 'since'}</span>
  </div>
  {#if langs.length}<LangBar {langs} mono={opts.mono} light={opts.light} />{/if}
</div>

<style>
  .card {
    width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 12px;
    padding: 14px 16px; border-radius: 14px; background: var(--bg-card); border: 1px solid var(--border);
  }
  .top { display: flex; gap: 12px; align-items: center; }
  .avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--border); object-fit: cover; flex-shrink: 0; }
  .ph { display: grid; place-items: center; font-size: 22px; font-weight: 700; background: var(--bg-hover); }
  .who { display: flex; flex-direction: column; min-width: 0; }
  .name { font-size: 16px; font-weight: 700; }
  .login { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
  .bio { font-size: 12px; margin-top: 3px; }
  .nums { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 8px 0; }
  .nums span { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .nums b { font-size: 17px; color: var(--text); letter-spacing: 0; }
</style>
