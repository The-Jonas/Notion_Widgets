<!-- Estilo "pill": barra horizontal com bordas redondas que vai enchendo,
     tempo à esquerda e botão de play à direita. Ótimo pra meia coluna. -->
<script lang="ts">
  import type { TimerController } from '../controller.svelte';
  import ModeTabs from '../parts/ModeTabs.svelte';
  import PhaseTabs from '../parts/PhaseTabs.svelte';
  import Presets from '../parts/Presets.svelte';
  import TaskInput from '../parts/TaskInput.svelte';
  import TodayStats from '../parts/TodayStats.svelte';

  let { t }: { t: TimerController } = $props();
</script>

<div class="face">
  <ModeTabs {t} />
  <PhaseTabs {t} />
  <div class="pill">
    <div class="fill" style:width="{t.progress * 100}%"></div>
    <div class="content">
      <div class="info">
        <span class="label">{t.label}</span>
        <span class="clock">{t.clock}</span>
      </div>
      <div class="buttons">
        <button class="small" onclick={() => t.reset()} title="Reset">↺</button>
        {#if t.mode === 'focus'}<button class="small" onclick={() => t.skip()} title="Skip">⏭</button>{/if}
        <button class="play" onclick={() => t.toggle()} disabled={t.timer.finished}>{t.timer.running ? '❚❚' : '▶'}</button>
      </div>
    </div>
  </div>
  <span class="sub">{t.subtitle}</span>
  <TaskInput {t} />
  <Presets {t} />
  {#if t.mode === 'focus'}<TodayStats {t} />{/if}
</div>

<style>
  .face { display: flex; flex-direction: column; align-items: center; gap: 8px; width: min(100%, 340px); }
  .pill {
    position: relative;
    width: 100%;
    height: 68px;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--text) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--phase) 35%, transparent);
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, color-mix(in srgb, var(--phase) 18%, transparent), color-mix(in srgb, var(--phase) 45%, transparent));
    transition: width 0.25s linear;
  }
  .content { position: relative; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 24px; }
  .info { display: flex; flex-direction: column; line-height: 1.1; }
  .label { font-size: 9px; font-weight: 700; letter-spacing: 0.22em; color: var(--phase); }
  .clock { font-family: var(--font-mono); font-size: 28px; font-weight: 700; color: var(--text); }
  .buttons { display: flex; align-items: center; gap: 6px; }
  button { border: none; cursor: pointer; color: var(--text); }
  .small { width: 28px; height: 28px; border-radius: 50%; background: color-mix(in srgb, var(--text) 9%, transparent); font-size: 12px; }
  .play { width: 48px; height: 48px; border-radius: 50%; background: var(--phase); color: #fff; font-size: 15px; }
  .play:disabled { opacity: 0.4; }
  .sub { font-size: 10px; color: var(--text-muted); letter-spacing: 0.1em; }
</style>
