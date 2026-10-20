// Cores das linguagens (as mesmas que o GitHub usa) e versão em cinza pro modo mono.

const COLORS: Record<string, string> = {
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Python: '#3572a5', Svelte: '#ff3e00', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219',
  Rust: '#dea584', Go: '#00add8', Shell: '#89e051', Lua: '#000080', Kotlin: '#a97bff',
  'Jupyter Notebook': '#da5b0b', Vue: '#41b883', Dart: '#00b4ab', PHP: '#4f5d95', Ruby: '#701516',
  GDScript: '#355570', Assembly: '#6e4c13', Makefile: '#427819', CMake: '#da3434',
};

const GRAYS_DARK = ['#e6e6e6', '#b5b5b5', '#8a8a8a', '#666666', '#4a4a4a', '#333333'];
const GRAYS_LIGHT = ['#37352f', '#5f5e5b', '#878682', '#a5a4a0', '#c4c3bf', '#dddcd8'];

/** Cor de uma linguagem; no modo mono, um tom de cinza pela posição na lista. */
export function langColor(name: string, mono: boolean, index = 0, light = false): string {
  if (mono) {
    const grays = light ? GRAYS_LIGHT : GRAYS_DARK;
    return grays[Math.min(index, grays.length - 1)];
  }
  return COLORS[name] ?? '#8b949e';
}
