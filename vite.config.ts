import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

// Lista cada pasta dentro de widgets/ que tenha um index.html e transforma
// numa página de entrada do build (cada widget ganha sua própria URL).
function widgetEntries(): Record<string, string> {
  const dir = resolve(root, 'widgets');
  const entries: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    const html = resolve(dir, name, 'index.html');
    if (existsSync(html)) entries[name] = html;
  }
  return entries;
}

// No dev o site roda em "/", no build publicado fica em "/Notion_Widgets/"
// (o caminho do GitHub Pages diferencia maiúsculas de minúsculas).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Notion_Widgets/' : '/',
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        workbench: resolve(root, 'index.html'),
        ...widgetEntries(),
      },
    },
  },
}));
