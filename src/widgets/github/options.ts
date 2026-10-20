// Opções do widget do GitHub lidas da URL.
import { getParam, getNumber, getBool } from '../../shared/params';

export interface GitHubOptions {
  user: string;
  mode: 'profile' | 'repos' | 'stats';
  style: 'card' | 'neofetch';
  repo: string;          // "dono/nome" pra mostrar um repositório só
  count: number;         // quantos repositórios no modo repos (count=all = todos)
  forks: boolean;        // inclui forks na lista
  sort: 'stars' | 'updated';
  pt: boolean;
  mono: boolean;         // accent=mono: linguagens em tons de cinza
  light: boolean;
}

/** Lê todas as opções da URL. */
export function readOptions(): GitHubOptions {
  const mode = getParam('mode', 'profile');
  return {
    user: getParam('user', '').trim().replace(/^@/, ''),
    mode: mode === 'repos' || mode === 'stats' ? mode : 'profile',
    style: getParam('style', 'card') === 'neofetch' ? 'neofetch' : 'card',
    repo: getParam('repo', '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''),
    count: getParam('count', '4') === 'all' ? 100 : Math.min(100, Math.max(1, Math.round(getNumber('count', 4)))),
    forks: getBool('forks', false),
    sort: getParam('sort', 'stars') === 'updated' ? 'updated' : 'stars',
    pt: getParam('lang', 'en-US') === 'pt-BR',
    mono: getParam('accent', 'blue') === 'mono',
    light: getParam('theme', 'dark') === 'light',
  };
}
