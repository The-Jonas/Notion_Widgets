// Cores das linguagens (as mesmas que o GitHub usa) e versão em cinza pro modo mono.

const COLORS: Record<string, string> = {
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Python: '#3572a5', Svelte: '#ff3e00', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219',
  Rust: '#dea584', Go: '#00add8', Shell: '#89e051', Lua: '#000080', Kotlin: '#a97bff',
  'Jupyter Notebook': '#da5b0b', Vue: '#41b883', Dart: '#00b4ab', PHP: '#4f5d95', Ruby: '#701516',
  GDScript: '#355570', Assembly: '#6e4c13', Makefile: '#427819', CMake: '#da3434',
  Haskell: '#5e5086', Cython: '#fedf5b', GLSL: '#5686a5', 'Objective-C': '#438eff', Scala: '#c22d40',
  Elixir: '#6e4a7e', R: '#198ce7', MATLAB: '#e16737', Zig: '#ec915c', Nix: '#7e7eff', Dockerfile: '#384d54',
  TeX: '#3d6117', Swift: '#f05138', 'Vim Script': '#199f4b', PowerShell: '#012456', Julia: '#a270ba',
  OCaml: '#ef7a08', Prolog: '#74283c', Verilog: '#b2b7f8', VHDL: '#adb2cb', SCSS: '#c6538c', Astro: '#ff5a03',
  Nim: '#ffc200', Perl: '#0298c3', Batchfile: '#c1f12e', 'Common Lisp': '#3fb68b', Elm: '#60b5cc',
  Fortran: '#4d41b1', Erlang: '#b83998', Clojure: '#db5855', 'F#': '#b845fc', Groovy: '#4298b8',
  Other: '#6e7681',
};

const GRAYS_DARK = ['#e6e6e6', '#c4c4c4', '#a3a3a3', '#858585', '#6b6b6b', '#555555', '#444444', '#383838'];
const GRAYS_LIGHT = ['#37352f', '#55534e', '#73716c', '#8f8d88', '#a9a7a2', '#bfbdb8', '#d1cfca', '#dddcd8'];

/** Cor de uma linguagem; no modo mono, um tom de cinza pela posição na lista. */
export function langColor(name: string, mono: boolean, index = 0, light = false): string {
  if (mono) {
    const grays = light ? GRAYS_LIGHT : GRAYS_DARK;
    return grays[Math.min(index, grays.length - 1)];
  }
  return COLORS[name] ?? '#8b949e';
}
