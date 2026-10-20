<!-- Editor ✎ que aparece no canto do widget ao passar o mouse.
     Mostra as mesmas opções da Workbench; salvar guarda os ajustes no navegador
     para ESTE embed e recarrega o widget. "Copy URL" gera a URL nova com tudo
     embutido, pra deixar a mudança permanente (e valer em outros aparelhos). -->
<script lang="ts">
  import { WIDGETS, COMMON_OPTIONS, PUBLIC_BASE, type WidgetOption } from './registry';
  import { currentParams, getOverrides, saveOverrides, clearOverrides } from './params';

  let { widgetId }: { widgetId: string } = $props();

  const widget = WIDGETS.find((w) => w.id === widgetId);
  const options: WidgetOption[] = widget ? [...COMMON_OPTIONS, ...widget.options] : [];
  const params = currentParams();
  const hasOverrides = Object.keys(getOverrides()).length > 0;

  let open = $state(false);
  let copied = $state(false);
  // valores atuais (URL + ajustes locais), ou o padrão de cada opção
  let values = $state<Record<string, string>>(
    Object.fromEntries(options.map((o) => [o.key, params.get(o.key) ?? o.default])),
  );

  /** Só as opções que fogem do padrão (URL mais curta). */
  function changed(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const o of options) {
      const v = String(values[o.key] ?? '');
      if (v !== o.default) out[o.key] = v;
    }
    return out;
  }

  /** Salva como ajuste local deste embed e recarrega o widget. */
  function save() {
    const diff = changed();
    // opções que voltaram ao padrão precisam "apagar" o valor da URL original
    for (const o of options) if (!(o.key in diff) && params.has(o.key)) diff[o.key] = o.default;
    saveOverrides(diff);
    location.reload();
  }

  /** Volta a seguir só a URL do embed. */
  function reset() {
    clearOverrides();
    location.reload();
  }

  /** URL pública nova com todas as opções escolhidas. */
  function newUrl(): string {
    const q = new URLSearchParams(changed()).toString();
    return `${PUBLIC_BASE}widgets/${widgetId}/${q ? `?${q}` : ''}`;
  }

  /** Copia a URL nova (com plano B pra iframes sem acesso ao clipboard). */
  async function copy() {
    const text = newUrl();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

{#if widget}
  <button class="pen" class:dot={hasOverrides} onclick={() => (open = true)} title="Edit this widget">✎</button>

  {#if open}
    <div class="backdrop" role="presentation" onclick={() => (open = false)}>
      <div class="panel" role="dialog" aria-label="Edit widget" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && (open = false)}>
        <header>
          <b>✎ {widget.name}</b>
          <button class="x" onclick={() => (open = false)} aria-label="Close">✕</button>
        </header>
        <div class="fields">
          {#each options as o (o.key)}
            <label>
              <span>{o.label}</span>
              {#if o.type === 'select'}
                <select bind:value={values[o.key]}>
                  {#each o.choices ?? [] as c (c)}<option value={c}>{c}</option>{/each}
                </select>
              {:else if o.type === 'toggle'}
                <input type="checkbox" checked={values[o.key] === '1'} onchange={(e) => (values[o.key] = e.currentTarget.checked ? '1' : '0')} />
              {:else}
                <input type={o.type === 'number' ? 'number' : 'text'} bind:value={values[o.key]} />
              {/if}
            </label>
          {/each}
        </div>
        <footer>
          <button class="main" onclick={save}>Save</button>
          <button onclick={copy}>{copied ? '✓ Copied' : 'Copy URL'}</button>
          {#if hasOverrides}<button class="ghost" onclick={reset}>Reset to embed</button>{/if}
        </footer>
        <p class="hint">Save keeps the changes for this embed on this device. To make them permanent everywhere, copy the URL and replace the embed link in Notion.</p>
      </div>
    </div>
  {/if}
{/if}

<style>
  .pen {
    position: fixed; right: 6px; bottom: 6px; z-index: 20;
    width: 24px; height: 24px; border-radius: 7px; border: 1px solid var(--border);
    background: var(--bg-card); color: var(--text-muted); font-size: 13px; cursor: pointer;
    opacity: 0; transition: opacity 0.2s;
  }
  /* só aparece com o mouse em cima do widget */
  :global(body:hover) .pen { opacity: 0.75; }
  .pen:hover { opacity: 1 !important; color: var(--text); }
  .pen.dot::after { content: ''; position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }

  .backdrop {
    position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center;
    padding: 6px; background: rgb(0 0 0 / 0.5);
  }
  .panel {
    width: 100%; max-width: 420px; max-height: 100%; display: flex; flex-direction: column; gap: 8px;
    padding: 10px 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border);
    color: var(--text); font: 12px var(--font-sans); box-shadow: 0 12px 32px rgb(0 0 0 / 0.4);
  }
  :global([data-bg='transparent']) .panel { background: #202020; }
  :global([data-theme='light'][data-bg='transparent']) .panel { background: #ffffff; }
  header { display: flex; justify-content: space-between; align-items: center; }
  .x { all: unset; cursor: pointer; padding: 2px 6px; color: var(--text-muted); }
  .fields { overflow: auto; display: flex; flex-direction: column; gap: 5px; padding-right: 4px; }
  label { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  label span { color: var(--text-muted); }
  select, input[type='text'], input[type='number'] {
    width: 170px; padding: 3px 6px; border-radius: 6px; border: 1px solid var(--border);
    background: var(--bg-page); color: var(--text); font: inherit;
  }
  footer { display: flex; gap: 6px; }
  footer button {
    padding: 5px 12px; border-radius: 7px; border: 1px solid var(--border); cursor: pointer;
    background: transparent; color: var(--text); font: inherit;
  }
  footer .main { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 700; }
  :global([data-accent='mono']) footer .main { color: #111; }
  footer .ghost { margin-left: auto; color: var(--text-muted); }
  .hint { margin: 0; font-size: 10px; color: var(--text-muted); line-height: 1.4; }
</style>
