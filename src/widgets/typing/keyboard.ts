// Teclado na tela: fileiras, dedo de cada tecla e onde fica cada caractere.

export type Finger = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'th';

export interface Key {
  base: string;     // caractere sem shift
  shifted: string;  // caractere com shift
  finger: Finger;
  width?: number;   // em "teclas" (1 = normal)
  label?: string;   // texto da tecla (quando não é o próprio caractere)
}

// dedo por coluna, igual em qualquer layout (posição física)
const COLS: Finger[] = ['lp', 'lp', 'lr', 'lm', 'li', 'li', 'ri', 'ri', 'rm', 'rr', 'rp', 'rp', 'rp', 'rp'];

/** Monta uma fileira a partir dos pares "normal|shift". */
function row(pairs: string[], offset: number): Key[] {
  return pairs.map((p, i) => {
    const [base, shifted] = p.split('|');
    return { base, shifted: shifted ?? base.toUpperCase(), finger: COLS[Math.min(i + offset, COLS.length - 1)] };
  });
}

export const LAYOUTS: Record<string, Key[][]> = {
  qwerty: [
    row(['`|~', '1|!', '2|@', '3|#', '4|$', '5|%', '6|^', '7|&', '8|*', '9|(', '0|)', '-|_', '=|+'], 0),
    row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[|{', ']|}', '\\||'], 1),
    row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';|:', "'|\""], 1),
    row(['z', 'x', 'c', 'v', 'b', 'n', 'm', ',|<', '.|>', '/|?'], 1),
  ],
  abnt2: [
    row(["'|\"", '1|!', '2|@', '3|#', '4|$', '5|%', '6|¨', '7|&', '8|*', '9|(', '0|)', '-|_', '=|+'], 0),
    row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '´|`', '[|{'], 1),
    row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '~|^', ']|}'], 1),
    row(['\\||', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',|<', '.|>', ';|:', '/|?'], 0),
  ],
};

export const FINGER_NAMES: Record<Finger, [string, string]> = {
  lp: ['left pinky', 'mindinho esquerdo'],
  lr: ['left ring', 'anelar esquerdo'],
  lm: ['left middle', 'médio esquerdo'],
  li: ['left index', 'indicador esquerdo'],
  ri: ['right index', 'indicador direito'],
  rm: ['right middle', 'médio direito'],
  rr: ['right ring', 'anelar direito'],
  rp: ['right pinky', 'mindinho direito'],
  th: ['thumb', 'polegar'],
};

export const FINGER_COLORS: Record<Finger, string> = {
  lp: '#e255a1', lr: '#9a6dd7', lm: '#529cca', li: '#4dab9a',
  ri: '#ffdc49', rm: '#ffa344', rr: '#ff7369', rp: '#d9730d', th: '#979a9b',
};

export interface KeyHit {
  key: Key | null;   // tecla do caractere (null = espaço)
  shift: boolean;    // precisa de shift
  dead: string;      // tecla morta antes (acentos), ex.: "´"
}

/** Descobre qual tecla (e se precisa de shift/acento) digita o caractere. */
export function findKey(layout: Key[][], ch: string): KeyHit {
  if (ch === ' ') return { key: null, shift: false, dead: '' };
  // acentos: a letra base + a tecla morta do acento
  const base = ch.normalize('NFD');
  let dead = '';
  if (base.length > 1 && ch !== 'ç' && ch !== 'Ç') {
    const mark = base.slice(1);
    dead = mark.includes('́') ? '´' : mark.includes('̀') ? '`' : mark.includes('̃') ? '~' : mark.includes('̂') ? '^' : mark.includes('̈') ? '¨' : '';
    ch = base[0];
  }
  for (const r of layout) {
    for (const k of r) {
      if (k.base === ch) return { key: k, shift: false, dead };
      if (k.shifted === ch) return { key: k, shift: true, dead };
    }
  }
  return { key: null, shift: false, dead };
}
