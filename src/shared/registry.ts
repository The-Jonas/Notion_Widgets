// Catálogo dos widgets. A Workbench lê esta lista pra montar
// o seletor, os controles de cada widget e a URL de embed.

export type OptionType = 'select' | 'toggle' | 'text' | 'number';

export interface WidgetOption {
  key: string;          // nome do parâmetro na URL
  label: string;        // texto mostrado na Workbench
  type: OptionType;
  default: string;      // valor padrão (sempre texto, igual à URL)
  choices?: string[];   // só pra type "select"
}

export interface WidgetInfo {
  id: string;           // nome da pasta em widgets/
  name: string;
  description: string;
  height: number;       // altura sugerida do embed no Notion (px)
  options: WidgetOption[];
}

/** Opções que todo widget aceita (aplicadas por applyTheme). */
export const COMMON_OPTIONS: WidgetOption[] = [
  { key: 'theme', label: 'Theme', type: 'select', default: 'dark', choices: ['dark', 'light'] },
  {
    key: 'accent', label: 'Accent', type: 'select', default: 'blue',
    choices: ['blue', 'purple', 'green', 'orange', 'red', 'pink', 'yellow', 'gray'],
  },
  { key: 'bg', label: 'Background', type: 'select', default: 'transparent', choices: ['transparent', 'card', 'page'] },
];

export const WIDGETS: WidgetInfo[] = [
  {
    id: 'clock',
    name: '🕐 Clock',
    description: 'Seven clock faces: orbit rings, dots, minimal, stacked type, analog, hybrid and digital.',
    height: 220,
    options: [
      { key: 'style', label: 'Style', type: 'select', default: 'orbit', choices: ['orbit', 'dots', 'minimal', 'stack', 'analog', 'hybrid', 'digital'] },
      { key: 'format', label: 'Format', type: 'select', default: '24', choices: ['24', '12'] },
      { key: 'seconds', label: 'Show seconds', type: 'toggle', default: '1' },
      { key: 'sweep', label: 'Smooth second hand', type: 'toggle', default: '1' },
      { key: 'numerals', label: 'Numerals 12/3/6/9', type: 'toggle', default: '0' },
      { key: 'date', label: 'Show date', type: 'toggle', default: '1' },
      { key: 'lang', label: 'Date language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
];

/** Endereço público do site no GitHub Pages (usado na URL copiada). */
export const PUBLIC_BASE = 'https://the-jonas.github.io/Notion_Widgets/';
