<!-- Painel de detalhes de um dia, aberto por cima do widget ao clicar num dia:
     resumo, curva de temperatura hora a hora, faixas de 3 em 3 horas com chuva,
     nascer/pôr do sol e UV. Navega entre os dias com ‹ › e fecha com ✕, Esc ou clique fora. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName, TEXT } from './api';
  import { deg, clock, uvLevel, dayHref } from './format';
  import WeatherIcon from './WeatherIcon.svelte';

  let { data, opts, index, onclose, onnav }: {
    data: WeatherData;
    opts: WeatherOptions;
    index: number;
    onclose: () => void;
    onnav: (index: number) => void;
  } = $props();

  const t = $derived(TEXT[opts.lang]);
  const pt = $derived(opts.lang === 'pt-BR');
  const day = $derived(data.daily[index]);
  const last = $derived(Math.min(data.daily.length, opts.days) - 1);
  // de 3 em 3 horas: 00h, 03h, ... 21h
  const slots = $derived(day.hours.filter((_, h) => h % 3 === 0));
  const google = $derived(dayHref(data, { ...opts, link: 'google' }, day.date, index));

  // curva da temperatura das 24 horas
  const W = 480;
  const H = 54;
  const lo = $derived(Math.min(...day.hours.map((h) => h.temp)));
  const hi = $derived(Math.max(...day.hours.map((h) => h.temp)));
  const curve = $derived(
    day.hours
      .map((h, k) => {
        const x = (k / Math.max(1, day.hours.length - 1)) * W;
        const y = 6 + (1 - (h.temp - lo) / Math.max(1, hi - lo)) * (H - 12);
        return `${k ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' '),
  );
  // hora atual (só no painel de hoje), pra marcar na curva
  const nowHour = $derived(index === 0 ? Number(data.current.time.slice(11, 13)) : -1);

  /** Fecha com Esc e navega com as setas do teclado. */
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    if (e.key === 'ArrowLeft' && index > 0) onnav(index - 1);
    if (e.key === 'ArrowRight' && index < last) onnav(index + 1);
  }
</script>

<svelte:window onkeydown={onkey} />

<!-- fundo escurecido: clicar fora do cartão fecha -->
<div class="backdrop" role="presentation" onclick={onclose}>
  <div class="panel" role="dialog" aria-label={dayName(day.date, index, opts.lang)} tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
    <header>
      <button class="nav" disabled={index === 0} onclick={() => onnav(index - 1)} aria-label="Previous day">‹</button>
      <div class="title">
        <WeatherIcon code={day.code} size={34} animate={opts.animate} />
        <div class="col">
          <b>{dayName(day.date, index, opts.lang)} · {new Date(`${day.date}T12:00:00`).toLocaleDateString(opts.lang, { day: 'numeric', month: 'short' })}</b>
          <span>{describe(day.code, opts.lang)} · {t.hi} {deg(day.max)} {t.lo} {deg(day.min)}</span>
        </div>
      </div>
      <button class="nav" disabled={index >= last} onclick={() => onnav(index + 1)} aria-label="Next day">›</button>
      <button class="close" onclick={onclose} aria-label="Close">✕</button>
    </header>

    {#if day.hours.length}
      <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" class="curve">
        <path d={curve} vector-effect="non-scaling-stroke" />
        {#if nowHour >= 0}
          <line x1={(nowHour / 23) * W} x2={(nowHour / 23) * W} y1="0" y2={H} class="now" vector-effect="non-scaling-stroke" />
        {/if}
      </svg>
      <div class="slots">
        {#each slots as h (h.time)}
          <div class="slot" class:current={nowHour >= 0 && Math.floor(nowHour / 3) * 3 === Number(h.time.slice(11, 13))}>
            <span class="hour">{clock(h.time)}</span>
            <WeatherIcon code={h.code} isDay={h.isDay} size={22} animate={false} />
            <b>{deg(h.temp)}</b>
            <small class:wet={h.rain >= 30}>{h.rain}%</small>
          </div>
        {/each}
      </div>
    {/if}

    <footer>
      <span>☔ {t.rain} {day.rain}%</span>
      <span>☀️ UV {Math.round(day.uv)} · {uvLevel(day.uv, pt)}</span>
      {#if day.sunrise}<span>🌅 {clock(day.sunrise)} → {clock(day.sunset)}</span>{/if}
      {#if google}<a href={google} target="_blank" rel="noreferrer">Google ↗</a>{/if}
    </footer>
  </div>
</div>

<style>
  .backdrop {
    position: fixed; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center;
    padding: 8px; background: rgb(0 0 0 / 0.45); animation: fade 0.15s ease-out;
  }
  .panel {
    width: 100%; max-width: 560px; max-height: 100%; overflow: auto;
    display: flex; flex-direction: column; gap: 8px; padding: 10px 12px;
    border-radius: 14px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.35); animation: pop 0.18s ease-out;
  }
  :global([data-bg='transparent']) .panel { background: #202020; }
  :global([data-theme='light'][data-bg='transparent']) .panel { background: #ffffff; }
  @keyframes fade { from { opacity: 0; } }
  @keyframes pop { from { transform: translateY(6px) scale(0.98); opacity: 0; } }
  header { display: flex; align-items: center; gap: 6px; }
  .title { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
  .col { display: flex; flex-direction: column; min-width: 0; }
  .col b { font-size: 14px; }
  .col span { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  button {
    all: unset; cursor: pointer; width: 26px; height: 26px; border-radius: 8px;
    display: grid; place-items: center; font-size: 18px; color: var(--text-muted);
  }
  button:hover:not(:disabled) { background: var(--bg-hover); color: var(--text); }
  button:disabled { opacity: 0.25; cursor: default; }
  .close { font-size: 13px; }
  .curve { width: 100%; height: 40px; }
  .curve path { fill: none; stroke: #ffa344; stroke-width: 2; }
  .curve .now { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 3 3; }
  .slots { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
  .slot { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 4px 0; border-radius: 8px; font-size: 11px; }
  .slot.current { background: color-mix(in srgb, var(--accent) 16%, transparent); }
  .hour { color: var(--text-muted); font-size: 10px; }
  .slot small { color: var(--text-muted); font-size: 10px; }
  .slot small.wet { color: #529cca; font-weight: 700; }
  footer { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 11px; color: var(--text-muted); }
  footer a { margin-left: auto; color: var(--accent); text-decoration: none; }
</style>
