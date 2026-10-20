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
    choices: ['blue', 'purple', 'green', 'orange', 'red', 'pink', 'yellow', 'gray', 'mono'],
  },
  { key: 'bg', label: 'Background', type: 'select', default: 'transparent', choices: ['transparent', 'card', 'page'] },
  { key: 'edit', label: 'Show ✎ editor on hover', type: 'toggle', default: '1' },
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
    description: 'Focus cycles, presets, daily stats and a game-time countdown. Seven styles. Change times, sound and texts with the ✎ editor.',
    height: 340,
    options: [
      { key: 'style', label: 'Style', type: 'select', default: 'ring', choices: ['ring', 'orbit', 'pill', 'card', 'retro', 'minimal', 'terminal'] },
      { key: 'gamemode', label: 'Show Game mode', type: 'toggle', default: '1' },
      { key: 'id', label: 'Timer name (separate timers, same settings)', type: 'text', default: '' },
      { key: 'mode', label: 'Start in', type: 'select', default: 'focus', choices: ['focus', 'game'] },
      { key: 'focus', label: 'Focus (min)', type: 'number', default: '25' },
      { key: 'short', label: 'Short break (min)', type: 'number', default: '5' },
      { key: 'long', label: 'Long break (min)', type: 'number', default: '15' },
      { key: 'rounds', label: 'Rounds to long break', type: 'number', default: '4' },
      { key: 'game', label: 'Game time (min)', type: 'number', default: '60' },
      { key: 'sound', label: 'Sound', type: 'select', default: 'chime', choices: ['chime', 'bell', 'digital', 'soft', 'none'] },
      { key: 'volume', label: 'Volume', type: 'select', default: '0.6', choices: ['0.2', '0.4', '0.6', '0.8', '1'] },
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
  {
    id: 'github',
    name: '🐙 GitHub',
    description: 'Your public GitHub: profile card (or neofetch style), repository cards, commit streak stats or most used languages. Use user=demo to preview.',
    height: 220,
    options: [
      { key: 'user', label: 'GitHub username', type: 'text', default: '' },
      { key: 'mode', label: 'Show', type: 'select', default: 'profile', choices: ['profile', 'repos', 'stats', 'langs'] },
      { key: 'style', label: 'Profile style', type: 'select', default: 'card', choices: ['card', 'neofetch'] },
      { key: 'repo', label: 'One repo (owner/name, optional)', type: 'text', default: '' },
      { key: 'count', label: 'Repos to show', type: 'select', default: '4', choices: ['2', '3', '4', '6', '8', '12', 'all'] },
      { key: 'forks', label: 'Include forks', type: 'toggle', default: '0' },
      { key: 'sort', label: 'Sort repos by', type: 'select', default: 'updated', choices: ['updated', 'stars'] },
      { key: 'layout', label: 'Languages layout', type: 'select', default: 'compact', choices: ['compact', 'donut', 'bars', 'terminal', 'pie', 'chips'] },
      { key: 'top', label: 'Languages to show', type: 'select', default: '6', choices: ['3', '4', '5', '6', '8', '10'] },
      { key: 'hide', label: 'Hide languages (comma separated)', type: 'text', default: '' },
      { key: 'by', label: 'Measure languages by', type: 'select', default: 'bytes', choices: ['bytes', 'repos'] },
      { key: 'sample', label: 'Recent repos counted', type: 'select', default: '30', choices: ['10', '20', '30', '50'] },
      { key: 'title', label: 'Card title (- hides)', type: 'text', default: '' },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
  {
    id: 'typing',
    name: '⌨️ Typing Trainer',
    description: 'Learn to type with 10 fingers: row lessons, real words (EN/PT), on-screen keyboard showing which finger to use, WPM/accuracy history and your most missed keys.',
    height: 460,
    options: [
      { key: 'mode', label: 'Start with', type: 'select', default: 'words', choices: ['words', 'home', 'top', 'bottom', 'numbers'] },
      { key: 'limit', label: 'Test length', type: 'select', default: '25w', choices: ['10w', '25w', '50w', '15s', '30s', '60s'] },
      { key: 'words', label: 'Word language', type: 'select', default: 'en', choices: ['en', 'pt', 'mix'] },
      { key: 'accents', label: 'Accents (á, ç, ã...)', type: 'toggle', default: '0' },
      { key: 'layout', label: 'Keyboard layout', type: 'select', default: 'qwerty', choices: ['qwerty', 'abnt2'] },
      { key: 'keyboard', label: 'Show keyboard', type: 'toggle', default: '1' },
      { key: 'goal', label: 'WPM goal', type: 'number', default: '40' },
      { key: 'daily', label: 'Daily practice (min, 0 hides)', type: 'number', default: '15' },
      { key: 'style', label: 'Style', type: 'select', default: 'clean', choices: ['clean', 'terminal'] },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
  {
    id: 'focus',
    name: '🍅 Focus Map',
    description: 'Your pomodoro minutes per day as a GitHub-style grid, bars or a terminal sparkline, with streak and totals. Fed by the Pomodoro widget on the same device.',
    height: 230,
    options: [
      { key: 'style', label: 'Style', type: 'select', default: 'grid', choices: ['grid', 'bars', 'terminal'] },
      { key: 'weeks', label: 'Weeks (grid)', type: 'select', default: '26', choices: ['12', '26', '52'] },
      { key: 'days', label: 'Days (bars)', type: 'select', default: '14', choices: ['7', '14', '30'] },
      { key: 'goal', label: 'Daily goal (min)', type: 'number', default: '50' },
      { key: 'stats', label: 'Show stats', type: 'toggle', default: '1' },
      { key: 'demo', label: 'Demo data', type: 'toggle', default: '0' },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
  {
    id: 'classes',
    name: '🎓 Classes Now/Next',
    description: 'Your weekly timetable in the link: what is on now (with time left), what is next, and a week view. Format: "mon,wed 08:00-09:50 Calculus @ Room 12; tue 14:00-15:50 Physics".',
    height: 220,
    options: [
      { key: 'classes', label: 'Timetable (day time-time Name @ Room; ...)', type: 'text', default: '' },
      { key: 'style', label: 'Style', type: 'select', default: 'card', choices: ['card', 'week', 'terminal', 'minimal'] },
      { key: 'room', label: 'Show room', type: 'toggle', default: '1' },
      { key: 'lang', label: 'Language', type: 'select', default: 'en-US', choices: ['en-US', 'pt-BR'] },
    ],
  },
];

/** Endereço público do site no GitHub Pages (usado na URL copiada). */
export const PUBLIC_BASE = 'https://the-jonas.github.io/Notion_Widgets/';
