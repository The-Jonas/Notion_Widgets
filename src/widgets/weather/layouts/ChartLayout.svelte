<!-- Layout gráfico: curvas suaves das máximas e mínimas da semana com a faixa
     entre elas preenchida, ícone e dia em cima de cada ponto. -->
<script lang="ts">
  import { type WeatherData, type WeatherOptions, describe, dayName } from '../api';
  import { deg, dayAction } from '../format';
  import WeatherIcon from '../WeatherIcon.svelte';

  let { data, opts, onpick }: { data: WeatherData; opts: WeatherOptions; onpick: (index: number) => void } = $props();
  const days = $derived(data.daily.slice(0, opts.days));

  const W = 600;
  const H = 120;
  const PAD_Y = 20;

  const lo = $derived(Math.min(...days.map((d) => d.min)));
  const hi = $derived(Math.max(...days.map((d) => d.max)));
  /** Coordenada x do dia i (centro da coluna). */
  const xAt = (i: number) => ((i + 0.5) / days.length) * W;
  /** Coordenada y de uma temperatura (maior = mais alto). */
  const yAt = (t: number) => PAD_Y + (1 - (t - lo) / Math.max(1, hi - lo)) * (H - PAD_Y * 2);

  /** Caminho SVG suave (Catmull-Rom convertido em Bézier) passando pelos pontos. */
  function smooth(points: [number, number][]): string {
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  const maxPts = $derived(days.map((d, i) => [xAt(i), yAt(d.max)] as [number, number]));
  const minPts = $derived(days.map((d, i) => [xAt(i), yAt(d.min)] as [number, number]));
  const maxPath = $derived(smooth(maxPts));
  const minPath = $derived(smooth(minPts));
  // faixa: sobe pela curva das máximas e volta pela das mínimas (de trás pra frente)
  const band = $derived(`${maxPath} L ${minPts[minPts.length - 1][0]} ${minPts[minPts.length - 1][1]} ${smooth([...minPts].reverse()).slice(1)} Z`);
</script>

<div class="chart">
  <header>
    <span class="temp">{deg(data.current.temp)}</span>
    <span class="desc">{describe(data.current.code, opts.lang)}</span>
    <span class="city">{data.place}{opts.showRegion && data.region ? ` · ${data.region}` : ''}</span>
  </header>
  <div class="cols" style:--n={days.length}>
    {#each days as d, i (d.date)}
      {@const act = dayAction(data, opts, d.date, i, onpick)}
      <svelte:element this={act.tag} {...act.attrs} class="col">
        <span class="name" class:today={i === 0}>{dayName(d.date, i, opts.lang)}</span>
        <WeatherIcon code={d.code} size={24} animate={opts.animate} />
      </svelte:element>
    {/each}
  </div>
  <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff7369" stop-opacity="0.35" />
        <stop offset="1" stop-color="#529cca" stop-opacity="0.25" />
      </linearGradient>
    </defs>
    <path d={band} fill="url(#band)" />
    <path d={maxPath} class="line max" vector-effect="non-scaling-stroke" />
    <path d={minPath} class="line min" vector-effect="non-scaling-stroke" />
  </svg>
  <div class="labels" style:--n={days.length}>
    {#each days as d, i (d.date)}
      <span class="lbl max" style:top="{(yAt(d.max) / H) * 100}%" style:left="{(xAt(i) / W) * 100}%">{deg(d.max)}</span>
      <span class="lbl min" style:top="{(yAt(d.min) / H) * 100}%" style:left="{(xAt(i) / W) * 100}%">{deg(d.min)}</span>
    {/each}
  </div>
</div>

<style>
  .chart { position: relative; width: 100%; max-width: 640px; display: flex; flex-direction: column; }
  header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
  .temp { font-size: 26px; font-weight: 700; }
  .desc { font-size: 13px; }
  .city { margin-left: auto; font-size: 11px; color: var(--text-muted); }
  .cols { display: grid; grid-template-columns: repeat(var(--n), 1fr); }
  .col { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .name { font-size: 11px; font-weight: 600; color: var(--text-muted); }
  .name.today { color: var(--accent); }
  svg { width: 100%; height: 110px; overflow: visible; }
  .line { fill: none; stroke-width: 2.5; stroke-linecap: round; }
  .line.max { stroke: #ff7369; }
  .line.min { stroke: #529cca; }
  /* os rótulos ficam por cima do svg, na mesma escala */
  .labels { position: absolute; left: 0; right: 0; bottom: 0; height: 110px; pointer-events: none; }
  .lbl { position: absolute; transform: translate(-50%, -140%); font-size: 11px; font-weight: 700; }
  .lbl.min { transform: translate(-50%, 40%); color: var(--text-muted); font-weight: 600; }
  /* blocos clicáveis: link ou botão sem o visual padrão do navegador */
  a, button { all: unset; box-sizing: border-box; color: inherit; text-decoration: none; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  a:hover, button:hover { transform: translateY(-2px); }
</style>
