<!-- Desenha o grid de contribuições e anima a cobrinha num <canvas>,
     seguindo o plano calculado pelo solver. A animação roda em loop. -->
<script lang="ts">
  import type { ContributionGrid } from './contributions';
  import type { SnakePlan, Point } from './solver';
  import type { SnakeColors } from './colors';

  let { grid, plan, colors, stepMs }: {
    grid: ContributionGrid;
    plan: SnakePlan;
    colors: SnakeColors;
    stepMs: number;
  } = $props();

  let box: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const PAUSE_MS = 1800;     // tempo parado no fim, antes de recomeçar
  const REFILL_MS = 700;     // fim da pausa: os quadradinhos reaparecem

  /** Interpolação linear entre dois pontos. */
  function lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /** Desenha um retângulo de cantos arredondados centrado em (cx, cy). */
  function roundSquare(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(cx - size / 2, cy - size / 2, size, size, radius);
    ctx.fill();
  }

  $effect(() => {
    const ctx = canvas.getContext('2d')!;
    const { path, eatenAt, length } = plan;
    const last = path.length - 1;
    const runMs = last * stepMs;
    const cycleMs = runMs + PAUSE_MS;
    let width = 0;
    let height = 0;
    let frame = 0;
    const t0 = performance.now();

    // ajusta a resolução do canvas ao tamanho do bloco (nítido em telas retina)
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = box.clientWidth;
      height = box.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    resize();

    /** Desenha um quadro da animação no instante "now". */
    const draw = (now: number) => {
      // o timestamp do rAF pode vir um pouco antes de t0 no primeiro quadro
      const t = Math.max(0, now - t0) % cycleMs;
      const stepF = Math.min(last, t / stepMs);
      const i = Math.min(last - 1, Math.floor(stepF));
      const frac = stepF - i;
      // nos últimos ms da pausa o grid volta a encher pra recomeçar
      const refill = t > cycleMs - REFILL_MS ? (t - (cycleMs - REFILL_MS)) / REFILL_MS : 0;

      // tamanho da casa: o grid + 1 casa de margem de cada lado cabe no bloco
      const s = Math.min(width / (grid.cols + 2), height / (grid.rows + 2));
      const ox = (width - s * (grid.cols + 2)) / 2 + s;
      const oy = (height - s * (grid.rows + 2)) / 2 + s;
      const center = (p: Point) => ({ x: ox + p.x * s + s / 2, y: oy + p.y * s + s / 2 });
      const cellSize = s * 0.8;
      const radius = s * 0.2;

      ctx.clearRect(0, 0, width, height);

      // quadradinhos: vazio por baixo e, por cima, a cor do nível encolhendo ao ser comido
      grid.cells.forEach((cell, k) => {
        const c = center(cell);
        ctx.fillStyle = colors.levels[0];
        roundSquare(ctx, c.x, c.y, cellSize, radius);
        if (cell.level === 0) return;
        let alive = Math.min(1, Math.max(0, (eatenAt[k] + 0.35 - stepF) / 0.7));
        if (refill > 0) alive = refill;
        if (alive <= 0) return;
        ctx.fillStyle = colors.levels[cell.level];
        roundSquare(ctx, c.x, c.y, cellSize * (0.35 + 0.65 * alive), radius * alive);
      });

      // estalo ao comer: um anel que se expande e some (mais forte nos níveis altos)
      if (!refill) {
        grid.cells.forEach((cell, k) => {
          const age = stepF - eatenAt[k];
          if (cell.level === 0 || age < 0 || age > 3) return;
          const c = center(cell);
          ctx.globalAlpha = (1 - age / 3) * (0.25 + cell.level * 0.15);
          ctx.strokeStyle = colors.levels[cell.level];
          ctx.lineWidth = s * 0.08;
          ctx.beginPath();
          ctx.arc(c.x, c.y, s * (0.35 + age * 0.35), 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // corpo: cada segmento segue a posição da cabeça alguns passos atrás
      const segments: Point[] = [];
      for (let k = 0; k < length; k++) {
        const a = path[Math.max(0, i - k)];
        const b = path[Math.max(0, i + 1 - k)];
        segments.push(center(lerp(a, b, frac)));
      }

      ctx.fillStyle = colors.snake;
      ctx.strokeStyle = colors.snake;
      // brilho suave em volta da cobrinha
      ctx.shadowColor = colors.snake;
      ctx.shadowBlur = s * 0.6;
      // ligação contínua entre os segmentos
      ctx.lineWidth = s * 0.62;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      segments.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      // segmentos afinando da cabeça pro rabo (desenha o rabo primeiro)
      for (let k = length - 1; k >= 0; k--) {
        const size = s * (0.92 - k * 0.08);
        roundSquare(ctx, segments[k].x, segments[k].y, size, size * 0.34);
      }
      ctx.shadowBlur = 0;

      // olhinhos olhando pra direção do movimento
      const from = path[i];
      const to = path[i + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      if (dx || dy) {
        const h = segments[0];
        const fx = dx * s * 0.16;
        const fy = dy * s * 0.16;
        const px = -dy * s * 0.17;
        const py = dx * s * 0.17;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        for (const side of [1, -1]) {
          ctx.beginPath();
          ctx.arc(h.x + fx + px * side, h.y + fy + py * side, s * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  });
</script>

<div class="box" bind:this={box}>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .box { position: relative; width: 100%; height: 100%; min-height: 0; }
  canvas { position: absolute; inset: 0; display: block; }
</style>
