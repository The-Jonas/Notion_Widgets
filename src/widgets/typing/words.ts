// Palavras e lições do treino de digitação.

import { EN_WORDS } from './wordlists/en';
import { PT_WORDS } from './wordlists/pt';

// listas sem repetição (o banco grande fica em wordlists/)
export const EN = [...new Set(EN_WORDS)];
export const PT = [...new Set(PT_WORDS)];

/** Tira acentos e cedilha (pra treinar sem as teclas mortas). */
export function plain(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// lições: as letras liberadas em cada etapa (a fileira do meio sempre entra)
export const LESSONS: Record<string, { label: string; labelPt: string; letters: string }> = {
  home: { label: 'Home row', labelPt: 'Fileira do meio', letters: 'asdfghjklç;' },
  top: { label: 'Top row', labelPt: 'Fileira de cima', letters: 'qwertyuiopasdfghjklç' },
  bottom: { label: 'Bottom row', labelPt: 'Fileira de baixo', letters: 'zxcvbnmasdfghjklç,.' },
  numbers: { label: 'Numbers', labelPt: 'Números', letters: '1234567890' },
};

/** Embaralha (Fisher-Yates). */
function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Palavra inventada só com as letras liberadas (completa as lições curtas). */
function pseudoWord(letters: string): string {
  const pool = letters.replace(/[;,.]/g, '');
  const len = 2 + Math.floor(Math.random() * 4);
  let w = '';
  for (let i = 0; i < len; i++) w += pool[Math.floor(Math.random() * pool.length)];
  return w;
}

/** Monta o texto do teste: `count` palavras do modo escolhido. */
export function buildText(mode: string, lang: string, count: number, accents: boolean, layout = 'qwerty'): string[] {
  if (mode === 'numbers') {
    return Array.from({ length: count }, () => String(Math.floor(Math.random() * 10 ** (1 + Math.floor(Math.random() * 4)))));
  }
  const source = lang === 'pt' ? PT : lang === 'mix' ? [...EN, ...PT] : EN;
  const words = source.map((w) => (accents ? w : plain(w)));
  const lesson = LESSONS[mode];
  if (!lesson) return shuffle(words).concat(shuffle(words)).slice(0, count);
  // lição: só palavras que cabem nas letras liberadas; completa com inventadas
  // ç só existe no ABNT2; no QWERTY a tecla do lado do L é o ;
  const letters = layout === 'abnt2' ? lesson.letters : lesson.letters.replace('ç', '');
  const allowed = new Set(letters);
  const fit = shuffle([...new Set([...EN, ...PT].map(plain))].filter((w) => [...w].every((ch) => allowed.has(ch))));
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(i % 2 === 0 && fit.length ? fit[i % fit.length] : pseudoWord(letters));
  return out;
}
