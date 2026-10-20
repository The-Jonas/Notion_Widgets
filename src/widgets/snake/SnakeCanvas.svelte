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
  import type { SnakeColors, SnakeLook, BarShape } from './colors';

  let { grid, plan, colors, stepMs, look, bar, shape }: {
    grid: ContributionGrid;
    plan: SnakePlan;
    colors: SnakeColors;
    stepMs: number;
    look: SnakeLook;
    bar: 'smooth' | 'steps' | 'none';   // como a barra enche (ou sem barra)
    shape: BarShape;                     // formato da barra
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

    /** Barra de progresso embaixo do grid, preenchida do nível 1 ao 4.
        Formatos (prop "shape"): rounded, square, segments, dots, line, levels. */
    const drawBar = (s: number, ox: number, oy: number, stepF: number, refill: number) => {
      const n = barLevels.length;
      if (!n || bar === 'none') return;
      const bx = ox + s * 0.1;
      const bw = grid.cols * s - s * 0.2;
      const by = oy + (grid.rows + 1) * s + s * 0.35;
      const bh = s * 0.7;

      // quantos quadradinhos já entraram na barra (com fração no modo smooth)
      let filled = 0;
      for (let j = 0; j < n; j++) {
        const grow = bar === 'steps'
          ? (stepF >= barTimes[j] ? 1 : 0)
          : Math.min(1, Math.max(0, stepF - barTimes[j] + 1));
        if (grow <= 0) break;
        filled += grow;
      }
      // na recarga a barra esvazia junto com o grid voltando
      if (refill) filled = n * (1 - refill);
      const colorAt = (unit: number) => colors.levels[barLevels[Math.min(n - 1, Math.max(0, Math.floor(unit)))]];
      const shapeNow = shape === 'auto' ? (look === 'pixel' ? 'square' : 'rounded') : shape;

      /** Preenche "parts" pedaços lado a lado; cada um acende conforme a fração já comida. */
      const drawParts = (parts: number, drawPart: (x: number, w: number, fill: number, color: string, empty: string) => void) => {
        const partW = bw / parts;
        for (let k = 0; k < parts; k++) {
          const u0 = (k / parts) * n;
          const u1 = ((k + 1) / parts) * n;
          const fill = Math.min(1, Math.max(0, (filled - u0) / (u1 - u0)));
          drawPart(bx + k * partW, partW, fill, colorAt((u0 + u1) / 2), colors.levels[0]);
        }
      };

      if (shapeNow === 'segments') {
        // 24 blocos separados, cada um acende por inteiro aos poucos
        drawParts(24, (x, w, fill, color, empty) => {
          ctx.fillStyle = empty;
          ctx.beginPath();
          ctx.roundRect(x + w * 0.08, by, w * 0.84, bh, bh * 0.25);
          ctx.fill();
          if (fill <= 0) return;
          ctx.save();
          ctx.globalAlpha = 0.25 + 0.75 * fill;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x + w * 0.08, by, w * 0.84, bh, bh * 0.25);
          ctx.fill();
          ctx.restore();
        });
        return;
      }

      if (shapeNow === 'dots') {
        // uma bolinha por semana do grid, acendendo em sequência
        const r = Math.min(bh * 0.5, bw / grid.cols * 0.32);
        drawParts(grid.cols, (x, w, fill, color, empty) => {
          ctx.fillStyle = empty;
          ctx.beginPath();
          ctx.arc(x + w / 2, by + bh / 2, r, 0, Math.PI * 2);
          ctx.fill();
          if (fill <= 0) return;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x + w / 2, by + bh / 2, r * (0.4 + 0.6 * fill), 0, Math.PI * 2);
          ctx.fill();
        });
        return;
      }

      if (shapeNow === 'levels') {
        // 4 barrinhas, uma por nível, com largura proporcional à quantidade de cada um
        const counts = [1, 2, 3, 4].map((l) => barLevels.filter((v) => v === l).length);
        const gap = s * 0.25;
        const usable = bw - gap * (counts.filter((c) => c).length - 1);
        let x = bx;
        let before = 0;
        counts.forEach((count, idx) => {
          if (!count) return;
          const w = (count / n) * usable;
          const fill = Math.min(1, Math.max(0, (filled - before) / count));
          ctx.fillStyle = colors.levels[0];
          ctx.beginPath();
          ctx.roundRect(x, by, w, bh, bh / 2);
          ctx.fill();
          if (fill > 0) {
            ctx.fillStyle = colors.levels[idx + 1];
            ctx.beginPath();
            ctx.roundRect(x, by, Math.max(bh, w * fill), bh, bh / 2);
            ctx.fill();
          }
          x += w + gap;
          before += count;
        });
        return;
      }

      // rounded, square e line: uma barra contínua
      const lineH = shapeNow === 'line' ? Math.max(2, s * 0.18) : bh;
      const ly = by + (bh - lineH) / 2;
      const radius = shapeNow === 'square' ? 0 : lineH / 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, ly, bw, lineH, radius);
      ctx.clip();
      ctx.fillStyle = colors.levels[0];
      ctx.fillRect(bx, ly, bw, lineH);
      const unitW = bw / n;
      for (let u = 0; u < Math.ceil(filled); u++) {
        ctx.fillStyle = colorAt(u);
        ctx.fillRect(bx + u * unitW, ly, unitW * Math.min(1, filled - u) + 0.5, lineH);
      }
      ctx.restore();
      if (shapeNow === 'line' && filled > 0) {
        // ponto brilhante na ponta da linha
        ctx.save();
        ctx.fillStyle = colorAt(filled - 1);
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = s * 0.6;
        ctx.beginPath();
        ctx.arc(bx + (filled / n) * bw, by + bh / 2, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
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
