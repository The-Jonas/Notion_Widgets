// Monta o editor ✎ por cima de qualquer widget (em uma raiz separada no <body>).
import { mount } from 'svelte';
import { getBool } from './params';
import Editor from './Editor.svelte';

/** Mostra o editor, a não ser que o embed peça ?edit=0. */
export function mountEditor(widgetId: string): void {
  if (!getBool('edit', true)) return;
  const host = document.createElement('div');
  document.body.appendChild(host);
  mount(Editor, { target: host, props: { widgetId } });
}
