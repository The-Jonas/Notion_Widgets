// Utilitários pra ler as opções do widget direto da URL.
// Ex.: .../widgets/clock/?theme=light&accent=green&seconds=1
//
// Por cima da URL ainda vêm os "ajustes locais": mudanças feitas pelo editor ✎
// dentro do próprio widget, salvas no navegador para ESTE embed (mesma URL).
// Assim dá pra reeditar um widget no Notion sem criar outro embed.

const urlParams = new URLSearchParams(window.location.search);
const OVERRIDES_KEY = `nw-overrides:${location.pathname}${location.search}`;

/** Ajustes locais salvos para este embed (vazio se não houver). */
export function getOverrides(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

/** Salva os ajustes locais deste embed (chaves com valor vazio voltam ao da URL). */
export function saveOverrides(values: Record<string, string>): void {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(values));
  } catch {
    /* sem armazenamento: o editor só não consegue salvar */
  }
}

/** Apaga os ajustes locais: o widget volta a seguir só a URL do embed. */
export function clearOverrides(): void {
  try {
    localStorage.removeItem(OVERRIDES_KEY);
  } catch {
    /* nada a fazer */
  }
}

// parâmetros efetivos = URL + ajustes locais por cima
const query = new URLSearchParams(urlParams);
for (const [key, value] of Object.entries(getOverrides())) query.set(key, value);

/** Todos os parâmetros efetivos (URL + ajustes locais), pro editor montar a URL nova. */
export function currentParams(): URLSearchParams {
  return new URLSearchParams(query);
}

/** Lê um parâmetro de texto; usa o valor padrão se não existir. */
export function getParam(name: string, fallback: string): string {
  return query.get(name) ?? fallback;
}

/** Lê um parâmetro booleano ("1", "true", "on" contam como verdadeiro). */
export function getBool(name: string, fallback: boolean): boolean {
  const raw = query.get(name);
  if (raw === null) return fallback;
  return ['1', 'true', 'on', 'yes'].includes(raw.toLowerCase());
}

/** Lê um parâmetro numérico; devolve o padrão se faltar ou não for número. */
export function getNumber(name: string, fallback: number): number {
  const value = Number(query.get(name));
  return query.has(name) && Number.isFinite(value) ? value : fallback;
}

/** Aplica tema, cor de destaque e fundo no <html> a partir dos parâmetros. */
export function applyTheme(): void {
  const html = document.documentElement;
  html.dataset.theme = getParam('theme', 'dark');
  html.dataset.accent = getParam('accent', 'blue');
  html.dataset.bg = getParam('bg', 'transparent');
}
