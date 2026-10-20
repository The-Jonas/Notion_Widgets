// Palavras e lições do treino de digitação.

export const EN = `the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is was are been has had did said each very through long where much should still own find here thing many right life tell great hand old world place again home while last never under keep same big house small found every point school number off always open begin seem help talk turn start show might city play run move live light night write mother father story read learn study code test build`
  .split(/\s+/);

export const PT = `de que não um uma para com por mais como mas foi ele ela isso seu sua dos das também quando muito nos já está eu só pelo pela até ser tem ter isso entre depois sem mesmo aos seus quem nas esse eles essa num nem suas meu minha numa pelos elas qual nós lhe deles essas esses pelas este dele tu você vocês vai vou fazer feito ano dia vez casa tempo vida coisa homem mulher mundo trabalho parte lugar caso ponto forma grupo problema mão filho olho noite água cidade nome hora país dinheiro amigo jogo livro aula prova estudo código função valor tela teclado escrever rápido devagar certo errado sempre nunca agora hoje amanhã ontem bom boa novo nova grande pequeno primeiro último melhor pior fácil difícil claro então porque onde aqui ali lá cada todo toda todos outro outra pouco tanto ainda bem mal sim talvez obrigado professor faculdade programa sistema projeto memória arquivo pasta janela`
  .split(/\s+/);

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
