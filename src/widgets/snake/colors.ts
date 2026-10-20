// Paletas da cobrinha: tons da cor de destaque ou os verdes clássicos do GitHub.

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

/** Monta a paleta a partir do tema, da cor de destaque (hex) e do estilo dos quadradinhos. */
export function buildColors(theme: 'dark' | 'light', accent: string, dots: 'accent' | 'github'): SnakeColors {
  const empty = EMPTY[theme];
  const levels = dots === 'github'
    ? GITHUB_GREENS[theme]
    : [0.38, 0.6, 0.8, 1].map((t) => mix(empty, accent, t));
  return { levels: [empty, ...levels], snake: accent };
}
