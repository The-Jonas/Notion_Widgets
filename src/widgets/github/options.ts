// Opções do widget do GitHub lidas da URL.
import { getParam, getNumber, getBool } from '../../shared/params';

export interface GitHubOptions {
  user: string;
  mode: 'profile' | 'repos' | 'stats' | 'langs';
  style: 'card' | 'neofetch';
  repo: string;          // "dono/nome" pra mostrar um repositório só
  count: number;         // quantos repositórios no modo repos (count=all = todos)
  forks: boolean;        // inclui forks na lista
  sort: 'stars' | 'updated';
  layout: LangLayout;    // visual do modo langs
  top: number;           // quantas linguagens aparecem (o resto vira "Other")
  hide: string[];        // linguagens escondidas (ex.: "Jupyter Notebook, HTML")
  by: 'bytes' | 'repos'; // como medir: bytes de código ou repositórios
  sample: number;        // quantos repositórios recentes entram na conta (by=bytes)
  title: string;         // título do card ("-" esconde)
  pt: boolean;
  mono: boolean;         // accent=mono: linguagens em tons de cinza
  light: boolean;
}

export type LangLayout = 'compact' | 'donut' | 'bars' | 'terminal' | 'pie' | 'chips';
const LAYOUTS: LangLayout[] = ['compact', 'donut', 'bars', 'terminal', 'pie', 'chips'];

/** Lê todas as opções da URL. */
export function readOptions(): GitHubOptions {
  const mode = getParam('mode', 'profile');
  return {
    user: getParam('user', '').trim().replace(/^@/, ''),
    mode: mode === 'repos' || mode === 'stats' || mode === 'langs' ? mode : 'profile',
    style: getParam('style', 'card') === 'neofetch' ? 'neofetch' : 'card',
    repo: getParam('repo', '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''),
    count: getParam('count', '4') === 'all' ? 100 : Math.min(100, Math.max(1, Math.round(getNumber('count', 4)))),
    forks: getBool('forks', false),
    sort: getParam('sort', 'updated') === 'stars' ? 'stars' : 'updated',
    layout: (LAYOUTS as string[]).includes(getParam('layout', 'compact')) ? (getParam('layout', 'compact') as LangLayout) : 'compact',
    top: Math.min(12, Math.max(1, Math.round(getNumber('top', 6)))),
    hide: getParam('hide', '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean),
    by: getParam('by', 'bytes') === 'repos' ? 'repos' : 'bytes',
    sample: Math.min(100, Math.max(1, Math.round(getNumber('sample', 30)))),
    title: getParam('title', ''),
    pt: getParam('lang', 'en-US') === 'pt-BR',
    mono: getParam('accent', 'blue') === 'mono',
    light: getParam('theme', 'dark') === 'light',
  };
}
