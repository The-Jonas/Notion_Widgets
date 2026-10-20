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
      { key: 'digits', label: 'Digital time (minimal)', type: 'toggle', default: '0' },
      { key: 'lang', label: 'Date language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
  {
    id: 'timer',
    name: '⏱ Pomodoro + Game Timer',
    description: 'Focus cycles, presets, daily stats and a game-time countdown. Six styles.',
    height: 340,
    options: [
      { key: 'style', label: 'Style', type: 'select', default: 'ring', choices: ['ring', 'orbit', 'pill', 'card', 'retro', 'minimal'] },
      { key: 'mode', label: 'Start in', type: 'select', default: 'focus', choices: ['focus', 'game'] },
      { key: 'focus', label: 'Focus (min)', type: 'number', default: '25' },
      { key: 'short', label: 'Short break (min)', type: 'number', default: '5' },
      { key: 'long', label: 'Long break (min)', type: 'number', default: '15' },
      { key: 'rounds', label: 'Rounds to long break', type: 'number', default: '4' },
      { key: 'game', label: 'Game time (min)', type: 'number', default: '60' },
      { key: 'sound', label: 'Sound', type: 'select', default: 'chime', choices: ['chime', 'bell', 'digital', 'soft', 'none'] },
      { key: 'tick', label: 'Tick while focusing', type: 'toggle', default: '0' },
      { key: 'auto', label: 'Auto-start next phase', type: 'toggle', default: '0' },
      { key: 'label_focus', label: 'Text · focus', type: 'text', default: '' },
      { key: 'label_short', label: 'Text · short break', type: 'text', default: '' },
      { key: 'label_long', label: 'Text · long break', type: 'text', default: '' },
      { key: 'label_game', label: 'Text · game', type: 'text', default: '' },
      { key: 'label_over', label: 'Text · game over', type: 'text', default: '' },
      { key: 'label_oversub', label: 'Text · game over line', type: 'text', default: '' },
    ],
  },
  {
    id: 'progress',
    name: '📊 Progress',
    description: 'How much of the day, week, month and year has passed (plus an optional custom range like a semester). Eleven layouts: bars, glow, outline, blocks, dots, retro, rings, concentric, columns, cards and text.',
    height: 220,
    options: [
      { key: 'style', label: 'Style', type: 'select', default: 'bars', choices: ['bars', 'glow', 'outline', 'blocks', 'dots', 'retro', 'rings', 'concentric', 'columns', 'cards', 'text'] },
      { key: 'title', label: 'Title (optional)', type: 'text', default: '' },
      { key: 'day', label: 'Show day', type: 'toggle', default: '1' },
      { key: 'week', label: 'Show week', type: 'toggle', default: '1' },
      { key: 'month', label: 'Show month', type: 'toggle', default: '1' },
      { key: 'year', label: 'Show year', type: 'toggle', default: '1' },
      { key: 'detail', label: 'Show details', type: 'toggle', default: '1' },
      { key: 'colors', label: 'Colors', type: 'select', default: 'single', choices: ['single', 'multi'] },
      { key: 'decimals', label: 'Decimals', type: 'select', default: '0', choices: ['0', '1', '2'] },
      { key: 'weekstart', label: 'Week starts on', type: 'select', default: 'monday', choices: ['monday', 'sunday'] },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
      { key: 'start', label: 'Custom range · start (YYYY-MM-DD)', type: 'text', default: '' },
      { key: 'end', label: 'Custom range · end (YYYY-MM-DD)', type: 'text', default: '' },
      { key: 'label_day', label: 'Text · day', type: 'text', default: '' },
      { key: 'label_week', label: 'Text · week', type: 'text', default: '' },
      { key: 'label_month', label: 'Text · month', type: 'text', default: '' },
      { key: 'label_year', label: 'Text · year', type: 'text', default: '' },
      { key: 'label_custom', label: 'Text · custom range', type: 'text', default: '' },
    ],
  },
  {
    id: 'snake',
    name: '🐍 GitHub Snake',
    description: 'A snake eating anyone\'s GitHub contribution graph, live in the browser. Set your username (or "demo"). "generated" shows the SVG built on deploy for the repo owner.',
    height: 200,
    options: [
      { key: 'user', label: 'GitHub username', type: 'text', default: '' },
      { key: 'style', label: 'Snake style', type: 'select', default: 'classic', choices: ['classic', 'smooth', 'neon', 'pixel'] },
      { key: 'dots', label: 'Squares', type: 'select', default: 'accent', choices: ['accent', 'github'] },
      {
        key: 'snake_color', label: 'Snake color', type: 'select', default: 'auto',
        choices: ['auto', 'blue', 'purple', 'green', 'orange', 'red', 'pink', 'yellow', 'gray'],
      },
      { key: 'snake_hex', label: 'Custom snake color (hex)', type: 'text', default: '' },
      { key: 'speed', label: 'Speed', type: 'select', default: 'normal', choices: ['slow', 'normal', 'fast'] },
      { key: 'bar', label: 'Progress bar', type: 'select', default: 'smooth', choices: ['smooth', 'steps', 'none'] },
      {
        key: 'bar_shape', label: 'Bar shape', type: 'select', default: 'auto',
        choices: ['auto', 'rounded', 'square', 'segments', 'dots', 'line', 'levels'],
      },
      { key: 'stats', label: 'Show stats line', type: 'toggle', default: '1' },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
      { key: 'source', label: 'Source', type: 'select', default: 'live', choices: ['live', 'generated'] },
    ],
  },
  {
    id: 'weather',
    name: '🌤 Weather',
    description: 'Current weather and the next days for any city (Open-Meteo, no API key). Ten layouts: classic, hero, glass, bento, chart, sun, list, minimal, strip and terminal. Use city=demo to preview offline.',
    height: 240,
    options: [
      { key: 'city', label: 'City (e.g. "Sobradinho, DF")', type: 'text', default: 'Brasília' },
      { key: 'label', label: 'Name shown (optional)', type: 'text', default: '' },
      { key: 'style', label: 'Style', type: 'select', default: 'classic', choices: ['classic', 'hero', 'glass', 'bento', 'chart', 'sun', 'list', 'minimal', 'strip', 'terminal'] },
      { key: 'units', label: 'Units', type: 'select', default: 'c', choices: ['c', 'f'] },
      { key: 'days', label: 'Days', type: 'select', default: '7', choices: ['3', '5', '7'] },
      { key: 'region', label: 'Show state and country', type: 'toggle', default: '1' },
      { key: 'details', label: 'Feels like, humidity, wind', type: 'toggle', default: '1' },
      { key: 'animate', label: 'Animated icons', type: 'toggle', default: '1' },
      { key: 'link', label: 'Click on a day opens', type: 'select', default: 'panel', choices: ['panel', 'google', 'windy', 'none'] },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
      { key: 'lat', label: 'Latitude (optional)', type: 'text', default: '' },
      { key: 'lon', label: 'Longitude (optional)', type: 'text', default: '' },
    ],
  },
];

/** Endereço público do site no GitHub Pages (usado na URL copiada). */
export const PUBLIC_BASE = 'https://the-jonas.github.io/Notion_Widgets/';
