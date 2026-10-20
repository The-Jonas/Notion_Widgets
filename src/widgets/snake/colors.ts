// Paletas da cobrinha: tons da cor de destaque ou os verdes clássicos do GitHub.

// visuais da cobrinha (ver SnakeCanvas.svelte)
export type SnakeLook = 'classic' | 'smooth' | 'neon' | 'pixel';
export const SNAKE_LOOKS: SnakeLook[] = ['classic', 'smooth', 'neon', 'pixel'];

export interface SnakeColors {
  levels: string[];   // 5 cores: vazio + níveis 1 a 4
  snake: string;
}

// cor do quadradinho vazio em cada tema (combina com o fundo do Notion)
const EMPTY = { dark: '#2a2a2a', light: '#ebebea' };

// verdes do GitHub (níveis 1 a 4)
const GITHUB_GREENS = {
  dark: ['#0e4429', '#006d32', '#26a641', '#39d353'],
  light: ['#9be9a8', '#40c463', '#30a14e', '#216e39'],
};

/** Mistura duas cores hex: t = 0 devolve "a", t = 1 devolve "b". */
function mix(a: string, b: string, t: number): string {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// cor "auto" da cobrinha quando os quadradinhos já usam a cor de destaque:
// um tom claro (ou escuro no tema claro) que contrasta com todos os níveis
const CONTRAST = { dark: '#ececec', light: '#37352f' };

/** Monta a paleta a partir do tema, da cor de destaque (hex), do estilo dos
    quadradinhos e da cor da cobrinha ("auto" ou um hex). */
export function buildColors(
  theme: 'dark' | 'light',
  accent: string,
  dots: 'accent' | 'github',
  snake: string | 'auto',
): SnakeColors {
  const empty = EMPTY[theme];
  const levels = dots === 'github'
    ? GITHUB_GREENS[theme]
    : [0.38, 0.6, 0.8, 1].map((t) => mix(empty, accent, t));
  const auto = dots === 'github' ? accent : CONTRAST[theme];
  return { levels: [empty, ...levels], snake: snake === 'auto' ? auto : snake };
}
