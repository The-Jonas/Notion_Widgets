<script lang="ts">
  import { WIDGETS, COMMON_OPTIONS, PUBLIC_BASE, type WidgetInfo, type WidgetOption } from '../shared/registry';

  // larguras que imitam onde o embed vai morar no Notion
  const SIZES = [
    { id: 'full', label: 'Full column', width: 708 },
    { id: 'half', label: 'Half column', width: 340 },
    { id: 'phone', label: 'Phone', width: 360 },
  ];

  let selectedId = $state(WIDGETS[0].id);
  let sizeId = $state('full');
  let values = $state<Record<string, string>>(defaultsFor(WIDGETS[0]));
  let height = $state(WIDGETS[0].height);
  let copied = $state(false);

  const widget = $derived(WIDGETS.find((w) => w.id === selectedId)!);
  const allOptions = $derived<WidgetOption[]>([...COMMON_OPTIONS, ...widget.options]);
  const width = $derived(SIZES.find((s) => s.id === sizeId)!.width);
  const query = $derived(buildQuery(allOptions, values));
  const localUrl = $derived(`${import.meta.env.BASE_URL}widgets/${widget.id}/${query}`);
  const publicUrl = $derived(`${PUBLIC_BASE}widgets/${widget.id}/${query}`);

  // devolve os valores padrão de todas as opções de um widget
  function defaultsFor(w: WidgetInfo): Record<string, string> {
    const result: Record<string, string> = {};
    for (const opt of [...COMMON_OPTIONS, ...w.options]) result[opt.key] = opt.default;
    return result;
  }

  // troca o widget selecionado e reseta as opções pros padrões dele
  function selectWidget(id: string): void {
    const next = WIDGETS.find((w) => w.id === id)!;
    selectedId = id;
    values = defaultsFor(next);
    height = next.height;
  }

  // monta a query string só com o que difere do padrão (URL mais curta)
  function buildQuery(options: WidgetOption[], current: Record<string, string>): string {
    const params = new URLSearchParams();
    for (const opt of options) {
      if (current[opt.key] !== opt.default) params.set(opt.key, current[opt.key]);
    }
    const text = params.toString();
    return text ? `?${text}` : '';
  }

  // copia a URL pública pra colar no /embed do Notion
  async function copyUrl(): Promise<void> {
    await navigator.clipboard.writeText(publicUrl);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="layout">
  <aside class="panel">
    <h1><code>- Workbench</code></h1>
    <p class="muted">Preview widgets exactly as they will look inside Notion.</p>

    <label class="field">
      <span>Widget</span>
      <select value={selectedId} onchange={(e) => selectWidget(e.currentTarget.value)}>
        {#each WIDGETS as w (w.id)}
          <option value={w.id}>{w.name}</option>
        {/each}
      </select>
    </label>
    <p class="muted small">{widget.description}</p>

    <h2>Frame</h2>
    <label class="field">
      <span>Size</span>
      <select bind:value={sizeId}>
        {#each SIZES as s (s.id)}
          <option value={s.id}>{s.label} · {s.width}px</option>
        {/each}
      </select>
    </label>
    <label class="field">
      <span>Height · {height}px</span>
      <input type="range" min="60" max="600" step="10" bind:value={height} />
    </label>

    <h2>Options</h2>
    {#each allOptions as opt (opt.key)}
      <label class="field">
        <span>{opt.label}</span>
        {#if opt.type === 'select'}
          <select bind:value={values[opt.key]}>
            {#each opt.choices ?? [] as c (c)}
              <option value={c}>{c}</option>
            {/each}
          </select>
        {:else if opt.type === 'toggle'}
          <input
            type="checkbox"
            checked={values[opt.key] === '1'}
            onchange={(e) => (values[opt.key] = e.currentTarget.checked ? '1' : '0')}
          />
        {:else}
          <input type={opt.type === 'number' ? 'number' : 'text'} bind:value={values[opt.key]} />
        {/if}
      </label>
    {/each}

    <h2>Embed</h2>
    <code class="url">{publicUrl}</code>
    <button onclick={copyUrl}>{copied ? '✓ Copied' : '📋 Copy embed URL'}</button>
    <p class="muted small">In Notion: <code>/embed</code> → paste → set the block height to {height}px.</p>
  </aside>

  <section class="stage" class:light={values.theme === 'light'}>
    <div class="notion-page" style:width="{width}px">
      <p class="fake-text">Notion page · {SIZES.find((s) => s.id === sizeId)?.label}</p>
      <iframe title={widget.name} src={localUrl} style:height="{height}px"></iframe>
      <p class="fake-text">Text below the embed</p>
    </div>
  </section>
</div>

<style>
  .layout { display: grid; grid-template-columns: 300px 1fr; min-height: 100vh; }

  .panel {
    padding: 20px;
    border-right: 1px solid var(--border);
    background: var(--bg-card);
    overflow-y: auto;
  }
  h1 { font-size: 18px; color: var(--accent); margin: 0 0 4px; }
  h2 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin: 22px 0 8px;
  }
  .muted { color: var(--text-muted); margin: 0 0 8px; }
  .small { font-size: 12px; }

  .field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  select, input[type='text'], input[type='number'] {
    background: var(--bg-page);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px 6px;
    min-width: 120px;
  }

  .url {
    display: block;
    font-size: 11px;
    word-break: break-all;
    padding: 8px;
    border-radius: var(--radius);
    background: var(--bg-page);
    margin-bottom: 8px;
  }
  button {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: var(--radius);
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }

  /* palco que imita uma página do Notion no tema escolhido */
  .stage {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 48px 24px;
    background: #191919;
  }
  .stage.light { background: #ffffff; }
  .stage.light .fake-text { color: #787774; }

  .notion-page { max-width: 100%; }
  .fake-text { color: #5a5a5a; font-size: 14px; margin: 8px 0; }
  iframe {
    width: 100%;
    border: none;
    border-radius: 4px;
    display: block;
  }
</style>
