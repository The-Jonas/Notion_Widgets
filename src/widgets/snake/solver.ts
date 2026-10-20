// Calcula o caminho da cobrinha: ela entra pelo canto, come os quadradinhos
// do nível mais fraco pro mais forte (1 → 4) desviando do próprio corpo e,
// no fim, volta pro canto de onde saiu (assim a animação fica em loop).
// Regra de ordem: na fase do nível L ela só pode atravessar casas vazias, já
// comidas ou de nível ≤ L. Um quadradinho fraco cercado de fortes fica pra
// depois e é comido assim que der pra chegar nele.
import type { ContributionGrid } from './contributions';

export interface Point {
  x: number;
  y: number;
}

export interface SnakePlan {
  path: Point[];        // posição da cabeça a cada passo (já com o corpo inicial)
  eatenAt: number[];    // passo em que cada célula foi comida (Infinity = nunca)
  length: number;       // tamanho do corpo em segmentos
}

export const SNAKE_LENGTH = 4;

/** Fila de prioridade mínima (heap binário) usada pelo Dijkstra. */
class MinHeap {
  private items: [number, number][] = [];

  /** Insere um nó com a prioridade dada. */
  push(priority: number, node: number): void {
    const a = this.items;
    a.push([priority, node]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  /** Remove e devolve o nó de menor prioridade (ou undefined se vazia). */
  pop(): [number, number] | undefined {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

/** Monta o plano completo da animação para o grid dado. */
export function planSnake(grid: ContributionGrid): SnakePlan {
  // a área andável tem 1 casa de margem em volta do grid (x de -1 a cols, y de -1 a rows)
  const W = grid.cols + 2;
  const H = grid.rows + 2;
  const id = (x: number, y: number) => (y + 1) * W + (x + 1);
  const fromId = (n: number): Point => ({ x: (n % W) - 1, y: Math.floor(n / W) - 1 });

  // nível de cada casa (-1 = fora do grid) e índice da célula correspondente
  const level = new Array<number>(W * H).fill(-1);
  const cellIndex = new Array<number>(W * H).fill(-1);
  grid.cells.forEach((c, i) => {
    level[id(c.x, c.y)] = c.level;
    cellIndex[id(c.x, c.y)] = i;
  });

  const eaten = new Array<boolean>(W * H).fill(false);
  const eatenAt = new Array<number>(grid.cells.length).fill(Infinity);

  const start = id(-1, -1);
  // corpo inicial todo empilhado no canto; path guarda só posições da cabeça
  const path: number[] = Array(SNAKE_LENGTH).fill(start);
  const body = () => path.slice(-SNAKE_LENGTH);

  /** Anda um passo: registra a posição e come o que tiver na casa. */
  const step = (n: number) => {
    path.push(n);
    if (level[n] > 0 && !eaten[n]) {
      eaten[n] = true;
      eatenAt[cellIndex[n]] = path.length - 1;
    }
  };

  /** Busca em largura da cabeça até a casa mais próxima que satisfaça "isGoal",
      atravessando só casas de nível ≤ maxLevel (ou já comidas). */
  const route = (isGoal: (n: number) => boolean, maxLevel: number, avoidBody: boolean): number[] | null => {
    const blocked = new Set<number>(avoidBody ? body().slice(0, -1) : []);
    const head = path[path.length - 1];
    blocked.delete(head);
    const dist = new Array<number>(W * H).fill(Infinity);
    const prev = new Array<number>(W * H).fill(-1);
    const heap = new MinHeap();
    dist[head] = 0;
    heap.push(0, head);
    for (let item = heap.pop(); item; item = heap.pop()) {
      const [d, n] = item;
      if (d > dist[n]) continue;
      if (n !== head && isGoal(n)) {
        const out: number[] = [];
        for (let k = n; k !== head; k = prev[k]) out.push(k);
        return out.reverse();
      }
      const { x, y } = fromId(n);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < -1 || ny < -1 || nx > grid.cols || ny > grid.rows) continue;
        const m = id(nx, ny);
        if (blocked.has(m)) continue;
        if (level[m] > maxLevel && !eaten[m]) continue;
        const nd = d + 1;
        if (nd < dist[m]) {
          dist[m] = nd;
          prev[m] = n;
          heap.push(nd, m);
        }
      }
    }
    return null;
  };

  // come nível por nível, sempre o alvo mais próximo; alvos inalcançáveis
  // ficam pra fase seguinte (por isso o alvo é "nível ≤ L", não "= L")
  for (let maxLevel = 1; maxLevel <= 4; maxLevel++) {
    const isGoal = (n: number) => level[n] > 0 && level[n] <= maxLevel && !eaten[n];
    for (;;) {
      const r = route(isGoal, maxLevel, true) ?? route(isGoal, maxLevel, false);
      if (!r) break;
      r.forEach(step);
    }
  }

  // volta pro canto inicial, saindo do grid
  const home = route((n) => n === start, 5, true) ?? route((n) => n === start, 5, false);
  home?.forEach(step);
  // termina com o corpo todo recolhido no canto
  for (let i = 0; i < SNAKE_LENGTH - 1; i++) path.push(start);

  return { path: path.map(fromId), eatenAt, length: SNAKE_LENGTH };
}
