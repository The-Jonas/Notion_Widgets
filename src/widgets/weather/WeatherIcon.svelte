<!-- Ícones de tempo desenhados em SVG (sol, lua, nuvem, chuva, neve, raio, neblina),
     com animações leves opcionais: raios girando, gotas e flocos caindo. -->
<script lang="ts">
  import { kindOf } from './api';

  let { code, isDay = true, size = 48, animate = true }: {
    code: number;
    isDay?: boolean;
    size?: number;
    animate?: boolean;
  } = $props();

  const kind = $derived(kindOf(code));
  // tempo "aberto" à noite vira lua
  const night = $derived(!isDay && (kind === 'clear' || kind === 'partly'));
  const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
</script>

<svg class="icon" class:animate width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
  {#snippet sun(cx: number, cy: number, r: number)}
    <g class="rays" style:transform-origin="{cx}px {cy}px">
      {#each RAYS as a (a)}
        <line
          x1={cx} y1={cy - r - 4} x2={cx} y2={cy - r - 9}
          transform="rotate({a} {cx} {cy})"
          class="ray"
        />
      {/each}
    </g>
    <circle cx={cx} cy={cy} r={r} class="sun" />
  {/snippet}

  {#snippet moon(cx: number, cy: number, r: number)}
    <path
      class="moon"
      d="M {cx + r * 0.35} {cy - r} A {r} {r} 0 1 0 {cx + r} {cy + r * 0.35} A {r * 0.8} {r * 0.8} 0 0 1 {cx + r * 0.35} {cy - r} Z"
    />
  {/snippet}

  {#snippet cloud(dark: boolean)}
    <g class="cloud" class:dark>
      <circle cx="24" cy="36" r="10" />
      <circle cx="36" cy="29" r="13" />
      <circle cx="47" cy="37" r="9" />
      <rect x="14" y="36" width="42" height="11" rx="5.5" />
    </g>
  {/snippet}

  {#if kind === 'clear'}
    {#if night}{@render moon(32, 32, 15)}{:else}{@render sun(32, 32, 11)}{/if}
  {:else if kind === 'partly'}
    <g transform="translate(-8 -9)">
      {#if night}{@render moon(32, 32, 12)}{:else}{@render sun(32, 32, 9)}{/if}
    </g>
    {@render cloud(false)}
  {:else if kind === 'cloudy'}
    <g transform="translate(-6 -6) scale(0.8)" opacity="0.6">{@render cloud(false)}</g>
    {@render cloud(false)}
  {:else if kind === 'fog'}
    <g transform="translate(0 -6)">{@render cloud(false)}</g>
    <line class="fog" x1="14" y1="48" x2="50" y2="48" />
    <line class="fog f2" x1="20" y1="55" x2="54" y2="55" />
  {:else}
    <g transform="translate(0 -8)">{@render cloud(kind === 'storm')}</g>
    {#if kind === 'rain' || kind === 'drizzle'}
      {#each kind === 'rain' ? [22, 32, 42] : [27, 39] as x, i (x)}
        <line class="drop" style:animation-delay="{i * 0.25}s" x1={x} y1="44" x2={x - 3} y2="51" />
      {/each}
    {:else if kind === 'snow'}
      {#each [22, 32, 42] as x, i (x)}
        <circle class="flake" style:animation-delay="{i * 0.4}s" cx={x} cy="48" r="2.4" />
      {/each}
    {:else if kind === 'storm'}
      <path class="bolt" d="M34 40 L26 52 H32 L29 61 L40 47 H33 L37 40 Z" />
    {/if}
  {/if}
</svg>

<style>
  .icon { display: block; overflow: visible; flex-shrink: 0; }
  .sun { fill: #ffc53d; }
  .ray { stroke: #ffc53d; stroke-width: 3; stroke-linecap: round; }
  .moon { fill: #d7defa; }
  .cloud { fill: #d9e1ea; }
  .cloud.dark { fill: #8f99a8; }
  :global([data-theme='light']) .cloud { fill: #b9c4d0; }
  :global([data-theme='light']) .cloud.dark { fill: #6f7a89; }
  .drop { stroke: #529cca; stroke-width: 3; stroke-linecap: round; }
  .flake { fill: #e8f1ff; stroke: #9fb6d6; stroke-width: 1; }
  .bolt { fill: #ffdc49; }
  .fog { stroke: #a9b3bf; stroke-width: 3.5; stroke-linecap: round; }

  /* animações (desligáveis com animate=0) */
  .animate .rays { animation: spin 18s linear infinite; }
  .animate .drop { animation: fall 1s linear infinite; }
  .animate .flake { animation: snow 2.4s ease-in-out infinite; }
  .animate .bolt { animation: flash 3s ease-in-out infinite; }
  .animate .fog { animation: drift 4s ease-in-out infinite alternate; }
  .animate .f2 { animation-delay: -2s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fall {
    0% { transform: translate(0, -4px); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(-3px, 6px); opacity: 0; }
  }
  @keyframes snow {
    0% { transform: translate(0, -5px); opacity: 0; }
    40% { opacity: 1; }
    100% { transform: translate(2px, 7px); opacity: 0; }
  }
  @keyframes flash { 0%, 70%, 100% { opacity: 1; } 75%, 85% { opacity: 0.25; } }
  @keyframes drift { from { transform: translateX(-3px); } to { transform: translateX(3px); } }
</style>
