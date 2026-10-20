// Utilitários pra ler as opções do widget direto da URL.
// Ex.: .../widgets/clock/?theme=light&accent=green&seconds=1

const query = new URLSearchParams(window.location.search);

/** Lê um parâmetro de texto da URL; usa o valor padrão se não existir. */
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

/** Aplica tema, cor de destaque e fundo no <html> a partir da URL. */
export function applyTheme(): void {
  const html = document.documentElement;
  html.dataset.theme = getParam('theme', 'dark');
  html.dataset.accent = getParam('accent', 'blue');
  html.dataset.bg = getParam('bg', 'transparent');
}
