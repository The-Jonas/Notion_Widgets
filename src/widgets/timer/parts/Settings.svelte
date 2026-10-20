<!-- Botão ⚙ e painel de ajustes: tempos, som, volume, tique-taque e auto-start. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  let { t }: { t: TimerController } = $props();
  import type { Labels } from '../engine';
  const SOUNDS = ['chime', 'bell', 'digital', 'soft', 'none'] as const;
  // campos de texto editáveis no painel (chave, nome e exemplo)
  const LABEL_FIELDS: { key: keyof Labels; name: string; placeholder: string }[] = [
    { key: 'focus', name: 'Focus', placeholder: 'FOCUS' },
    { key: 'short', name: 'Short break', placeholder: 'SHORT BREAK' },
    { key: 'long', name: 'Long break', placeholder: 'LONG BREAK' },
    { key: 'game', name: 'Game', placeholder: 'GAME TIME' },
    { key: 'over', name: 'Game over', placeholder: 'GAME OVER' },
    { key: 'overSub', name: 'Game over line', placeholder: 'back to quests ⚔️' },
  ];
</script>

<button class="gear" onclick={() => (t.settingsOpen = !t.settingsOpen)} title="Settings">⚙</button>

{#if t.settingsOpen}
  <div class="panel">
    <header>
      <strong>Settings</strong>
      <button class="close" onclick={() => (t.settingsOpen = false)}>✕</button>
    </header>
    <label>Focus <input type="number" min="1" max="180" bind:value={t.settings.focus} onchange={() => t.settingsChanged('time')} /> min</label>
    <label>Short break <input type="number" min="1" max="60" bind:value={t.settings.short} onchange={() => t.settingsChanged('time')} /> min</label>
    <label>Long break <input type="number" min="1" max="90" bind:value={t.settings.long} onchange={() => t.settingsChanged('time')} /> min</label>
    <label>Rounds <input type="number" min="1" max="12" bind:value={t.settings.rounds} onchange={() => t.settingsChanged('rounds')} /></label>
    <label>
      Sound
      <select bind:value={t.settings.sound}>
        {#each SOUNDS as s (s)}<option value={s}>{s}</option>{/each}
      </select>
      <button class="test" onclick={() => t.previewSound()}>▶</button>
    </label>
    <label>Volume <input type="range" min="0" max="1" step="0.05" bind:value={t.settings.volume} /></label>
    <label class="check"><input type="checkbox" bind:checked={t.settings.tick} /> Tick while focusing</label>
    <label class="check"><input type="checkbox" bind:checked={t.settings.auto} /> Auto-start next phase</label>

    <strong class="section">Texts</strong>
    <span class="hint">Leave empty to use the style's default.</span>
    {#each LABEL_FIELDS as f (f.key)}
      <label>{f.name} <input class="text" placeholder={f.placeholder} maxlength="28" bind:value={t.settings.labels[f.key]} /></label>
    {/each}
  </div>
{/if}

<style>
  .gear {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 2;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    opacity: 0.6;
  }
  .gear:hover { opacity: 1; }

  .panel {
    position: absolute;
    inset: 6px;
    z-index: 3;
    overflow-y: auto;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 12px;
  }
  header { display: flex; justify-content: space-between; align-items: center; }
  .close, .test {
    border: none;
    background: color-mix(in srgb, var(--text) 8%, transparent);
    color: var(--text);
    border-radius: 6px;
    cursor: pointer;
    padding: 2px 7px;
  }
  label { display: flex; align-items: center; gap: 6px; justify-content: space-between; color: var(--text-muted); }
  label.check { justify-content: flex-start; }
  input[type='number'], select {
    width: 64px;
    background: var(--bg-page);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2px 4px;
    margin-left: auto;
  }
  input.text {
    width: 140px;
    margin-left: auto;
    background: var(--bg-page);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2px 6px;
  }
  .section { margin-top: 6px; color: var(--text); }
  .hint { font-size: 10px; color: var(--text-muted); margin-top: -4px; }
  input[type='range'] { width: 110px; accent-color: var(--phase); }
  input[type='checkbox'] { accent-color: var(--phase); }
</style>
