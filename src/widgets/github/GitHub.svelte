<!-- Widget do GitHub: perfil (card ou neofetch), repositórios ou estatísticas de commits.
     Busca os dados públicos e escolhe a visualização pelo ?mode= -->
<script lang="ts">
  import { readOptions } from './options';
  import { fetchProfile, fetchRepos, fetchRepo, fetchContributions, type Profile, type Repo } from './api';
  import type { ContributionGrid } from '../snake/contributions';
  import ProfileCard from './views/ProfileCard.svelte';
  import Neofetch from './views/Neofetch.svelte';
  import RepoGrid from './views/RepoGrid.svelte';
  import StatsCard from './views/StatsCard.svelte';

  const opts = readOptions();

  let profile = $state<Profile | null>(null);
  let repos = $state<Repo[] | null>(null);
  let grid = $state<ContributionGrid | null>(null);
  let error = $state('');

  /** Busca só o que a visualização escolhida precisa. */
  async function load() {
    try {
      if (opts.mode === 'profile') {
        [profile, repos] = await Promise.all([fetchProfile(opts.user), fetchRepos(opts.user)]);
      } else if (opts.mode === 'repos') {
        repos = opts.repo ? [await fetchRepo(opts.repo)] : await fetchRepos(opts.user);
      } else {
        grid = await fetchContributions(opts.user);
      }
    } catch (e) {
      error = (e as Error).message;
    }
  }

  const needsUser = !opts.user && !(opts.mode === 'repos' && opts.repo);
  if (!needsUser) load();

  const ready = $derived(
    opts.mode === 'profile' ? !!(profile && repos) : opts.mode === 'repos' ? !!repos : !!grid,
  );
</script>

<main>
  {#if needsUser}
    <p class="note">Set your GitHub username in the <code>user</code> option<br />(or <code>user=demo</code> to preview).</p>
  {:else if error}
    <p class="note">{error}</p>
  {:else if !ready}
    <p class="note loading">Loading @{opts.user || opts.repo}…</p>
  {:else if opts.mode === 'profile' && profile && repos}
    {#if opts.style === 'neofetch'}
      <Neofetch {profile} {repos} {opts} />
    {:else}
      <ProfileCard {profile} {repos} {opts} />
    {/if}
  {:else if opts.mode === 'repos' && repos}
    <RepoGrid {repos} {opts} />
  {:else if grid}
    <StatsCard {grid} {opts} />
  {/if}
</main>

<style>
  main { height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px 12px; }
  .note { max-width: 420px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.6; }
  .loading { animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 50% { opacity: 0.4; } }
  code { font-family: var(--font-mono); font-size: 12px; }
</style>
