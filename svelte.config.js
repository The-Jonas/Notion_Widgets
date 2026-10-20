import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// habilita TypeScript dentro dos componentes .svelte
export default {
  preprocess: vitePreprocess(),
};
