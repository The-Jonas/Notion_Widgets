<!-- Desenha o grid de contribuições e anima a cobrinha num <canvas>,
     seguindo o plano calculado pelo solver. A animação roda em loop.
     Visuais da cobrinha (prop "look"):
       classic → quadradinhos arredondados afinando, igual à cobrinha original do GitHub
       smooth  → corpo contínuo (tubo) que faz as curvas certinho, com olhinhos
       neon    → o tubo com brilho, olhinhos e um estalo ao comer
       pixel   → blocos quadrados que andam casa a casa, estilo jogo antigo -->
<script lang="ts">
  import type { ContributionGrid } from './contributions';
  import type { SnakePlan, Point } from './solver';
  import type { SnakeColors, SnakeLook } from './colors';

  let { grid, plan, colors, stepMs, look, bar }: {
    grid: ContributionGrid;
    plan: SnakePlan;
    colors: SnakeColors;
    stepMs: number;
    look: SnakeLook;
    bar: 'smooth' | 'steps' | 'none';   // como a barra enche (ou sem barra)
  } = $props();

  let box: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const PAUSE_MS = 1800;     // tempo parado no fim, antes de recomeçar
  const REFILL_MS = 700;     // fim da pausa: os quadradinhos reaparecem

  /** Interpolação linear entre dois pontos. */
  function lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /** Diz se uma cor hex é clara (pra escolher a cor das pupilas). */
  function isLight(hex: string): boolean {
    const [r, g, b] = (hex.match(/\w\w/g) ?? ['80', '80', '80']).map((h) => parseInt(h, 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 140;
  }

  /** Desenha um retângulo (cantos arredondados opcionais) centrado em (cx, cy). */
  function square(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(cx - size / 2, cy - size / 2, size, size, radius);
    ctx.fill();
  }

  $effect(() => {
    const ctx = canvas.getContext('2d')!;
    const { path, eatenAt, length } = plan;
    const last = path.length - 1;
    const cycleMs = last * stepMs + PAUSE_MS;
    let width = 0;
    let height = 0;
    let frame = 0;
    const t0 = performance.now();

    // barra de progresso sempre em ordem: as cores vão do nível 1 ao 4 e cada
    // quadradinho comido acende o próximo pedaço (independente de qual foi)
    const colored = grid.cells.map((c, k) => ({ level: c.level, at: eatenAt[k] })).filter((c) => c.level > 0);
    const barLevels = colored.map((c) => c.level).sort((a, b) => a - b);
    const barTimes = colored.map((c) => c.at).sort((a, b) => a - b);

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
      // no pixel a cobrinha pula de casa em casa (sem deslizar)
      const frac = look === 'pixel' ? 0 : stepF - i;
      // nos últimos ms da pausa o grid volta a encher pra recomeçar
      const refill = t > cycleMs - REFILL_MS ? (t - (cycleMs - REFILL_MS)) / REFILL_MS : 0;

      // tamanho da casa: grid + 1 casa de margem em volta (+ 1 linha pra barra)
      const rowsTotal = grid.rows + (bar === 'none' ? 2 : 3.2);
      const s = Math.min(width / (grid.cols + 2), height / rowsTotal);
      const ox = (width - s * (grid.cols + 2)) / 2 + s;
      const oy = (height - s * rowsTotal) / 2 + s;
      const center = (p: Point) => ({ x: ox + p.x * s + s / 2, y: oy + p.y * s + s / 2 });
      const cellSize = s * 0.8;
      const cellRadius = look === 'pixel' ? s * 0.06 : s * 0.2;

      ctx.clearRect(0, 0, width, height);

      // quadradinhos: vazio por baixo e, por cima, a cor do nível encolhendo ao ser comido
      grid.cells.forEach((cell, k) => {
        const c = center(cell);
        ctx.fillStyle = colors.levels[0];
        square(ctx, c.x, c.y, cellSize, cellRadius);
        if (cell.level === 0) return;
        let alive = Math.min(1, Math.max(0, (eatenAt[k] + 0.35 - stepF) / 0.7));
        if (look === 'pixel') alive = eatenAt[k] <= stepF ? 0 : 1;
        if (refill > 0) alive = refill;
        if (alive <= 0) return;
        ctx.fillStyle = colors.levels[cell.level];
        square(ctx, c.x, c.y, cellSize * (0.35 + 0.65 * alive), cellRadius * alive);
      });

      // neon: estalo ao comer, um anel que se expande e some
      if (look === 'neon' && !refill) {
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

      drawBar(s, ox, oy, stepF, refill);
      drawSnake(s, center, i, frac);

      frame = requestAnimationFrame(draw);
    };

    /** Barra de progresso embaixo do grid, preenchida do nível 1 ao 4. */
    const drawBar = (s: number, ox: number, oy: number, stepF: number, refill: number) => {
      if (!barLevels.length || bar === 'none') return;
      const bx = ox + s * 0.1;
      const bw = grid.cols * s - s * 0.2;
      const by = oy + (grid.rows + 1) * s + s * 0.35;
      const bh = s * 0.7;
      const segW = bw / barLevels.length;
      // na recarga a barra esvazia junto com o grid voltando
      const visible = refill ? Math.round(barLevels.length * (1 - refill)) : barLevels.length;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, look === 'pixel' ? 0 : bh / 2);
      ctx.clip();
      ctx.fillStyle = colors.levels[0];
      ctx.fillRect(bx, by, bw, bh);
      for (let j = 0; j < visible; j++) {
        // smooth: cada pedaço cresce deslizando; steps: acende inteiro de uma vez (igual ao original)
        const grow = bar === 'steps'
          ? (stepF >= barTimes[j] ? 1 : 0)
          : Math.min(1, Math.max(0, stepF - barTimes[j] + 1));
        if (grow <= 0) break;
        ctx.fillStyle = colors.levels[barLevels[j]];
        ctx.fillRect(bx + j * segW, by, segW * grow + 0.5, bh);
      }
      ctx.restore();
    };

    /** Desenha a cobrinha no visual escolhido. */
    const drawSnake = (s: number, center: (p: Point) => Point, i: number, frac: number) => {
      const at = (k: number) => path[Math.max(0, Math.min(last, k))];
      // posição (interpolada) de cada segmento: o segmento k está k passos atrás da cabeça
      const segments: Point[] = [];
      for (let k = 0; k < length; k++) segments.push(center(lerp(at(i - k), at(i + 1 - k), frac)));

      ctx.fillStyle = colors.snake;
      ctx.strokeStyle = colors.snake;

      if (look === 'classic' || look === 'pixel') {
        // segmentos soltos afinando da cabeça pro rabo (o rabo é desenhado primeiro)
        for (let k = length - 1; k >= 0; k--) {
          const size = look === 'pixel' ? s * 0.84 : s * (0.94 - k * 0.11);
          square(ctx, segments[k].x, segments[k].y, size, look === 'pixel' ? 0 : size * 0.3);
        }
        return;
      }

      // smooth/neon: o tubo passa pelo centro das casas reais do caminho,
      // então as curvas ficam em ângulo reto (nada de cortar na diagonal)
      const spine: Point[] = [segments[0]];
      for (let k = 0; k < length - 1; k++) spine.push(center(at(i - k)));
      spine.push(segments[length - 1]);

      if (look === 'neon') {
        ctx.shadowColor = colors.snake;
        ctx.shadowBlur = s * 0.8;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // cada trecho um pouco mais fino que o anterior: o corpo afina até o rabo
      for (let k = spine.length - 2; k >= 0; k--) {
        ctx.lineWidth = s * (0.74 - (k / (spine.length - 1)) * 0.34);
        ctx.beginPath();
        ctx.moveTo(spine[k].x, spine[k].y);
        ctx.lineTo(spine[k + 1].x, spine[k + 1].y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      if (look === 'neon') {
        // reflexo claro no meio do tubo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = s * 0.14;
        ctx.beginPath();
        spine.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      }

      // olhinhos olhando pra direção do movimento
      const dx = at(i + 1).x - at(i).x;
      const dy = at(i + 1).y - at(i).y;
      if (dx || dy) {
        const h = segments[0];
        const fx = dx * s * 0.12;
        const fy = dy * s * 0.12;
        const px = -dy * s * 0.17;
        const py = dx * s * 0.17;
        // pupilas escuras em cobrinha clara e claras em cobrinha escura
        ctx.fillStyle = isLight(colors.snake) ? '#141414' : '#f5f5f5';
        for (const side of [1, -1]) {
          ctx.beginPath();
          ctx.arc(h.x + fx + px * side, h.y + fy + py * side, s * 0.075, 0, Math.PI * 2);
          ctx.fill();
        }
      }
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
