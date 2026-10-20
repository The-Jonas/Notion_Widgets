// Gera a lista de arquivos da cobrinha (Platane/snk) pro workflow de deploy:
// uma variação pra cada tema (dark/light) × cor de destaque × estilo dos quadradinhos.
// Saída no formato de output multilinha do GitHub Actions ("list<<EOF ... EOF").

// mesmas cores de destaque do src/shared/theme.css
const ACCENTS = {
  blue: '#529cca', purple: '#9a6dd7', green: '#4dab9a', orange: '#ffa344',
  red: '#ff7369', pink: '#e255a1', yellow: '#ffdc49', gray: '#979a9b',
};

// cor do quadradinho vazio em cada tema (combina com o fundo do Notion)
const EMPTY = { dark: '#2a2a2a', light: '#ebebea' };

// verdes clássicos do GitHub (do vazio até muitas contribuições)
const GITHUB_GREENS = {
  dark: ['#2a2a2a', '#0e4429', '#006d32', '#26a641', '#39d353'],
  light: ['#ebebea', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
};

/** Mistura duas cores hex: t = 0 devolve "a", t = 1 devolve "b". */
function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const lines = [];
for (const theme of ['dark', 'light']) {
  for (const [name, hex] of Object.entries(ACCENTS)) {
    // quadradinhos em tons da cor de destaque
    const tinted = [EMPTY[theme], ...[0.3, 0.55, 0.8, 1].map((t) => mix(EMPTY[theme], hex, t))];
    lines.push(`dist/snake/snake-${theme}-${name}-accent.svg?color_snake=${hex}&color_dots=${tinted.join(',')}`);
    // quadradinhos verdes do GitHub, cobrinha na cor de destaque
    lines.push(`dist/snake/snake-${theme}-${name}-github.svg?color_snake=${hex}&color_dots=${GITHUB_GREENS[theme].join(',')}`);
  }
}

console.log(`list<<EOF\n${lines.join('\n')}\nEOF`);
