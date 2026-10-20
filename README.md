# Notion_Widgets
Custom embeddable widgets for my Notion life-planner: Pomodoro, game timer, clock, semester progress and countdowns. Svelte + Vite, hosted on GitHub Pages.

## Run locally
```bash
npm install      # first time only
npm run dev      # opens the Workbench at http://localhost:5173
```
The **Workbench** previews each widget inside a fake Notion page, lets you tweak its options and copies the final embed URL.

## Use in Notion
1. Pick a widget in the Workbench and set its options.
2. Click **Copy embed URL**.
3. In Notion type `/embed`, paste the URL and resize the block to the suggested height.

## Widgets
| Widget | URL | Options |
|---|---|---|
| Clock | `widgets/clock/` | `style` (orbit/dots/minimal/stack/analog/hybrid/digital), `format` (24/12), `seconds`, `sweep`, `numerals`, `digits`, `date`, `lang` |
| Timer | `widgets/timer/` | `style` (ring/orbit/pill/card/retro/minimal/terminal), `gamemode` (0 hides the Game mode), `id` (each embed URL is its own timer; same URL = synced; `id` names a timer), `mode`, `focus`, `short`, `long`, `rounds`, `game`, `sound`, `tick`, `auto`, `label_*` |
| Progress | `widgets/progress/` | `style` (bars/glow/outline/blocks/dots/retro/rings/concentric/columns/cards/text), `title`, `day`, `week`, `month`, `year`, `detail`, `colors` (single/multi), `decimals`, `weekstart`, `lang`, `start` + `end` (custom range), `label_*` |
| GitHub Snake | `widgets/snake/` | `user` (GitHub username, or `demo`), `style` (classic/smooth/neon/pixel), `dots` (accent/github), `snake_color` (auto or a Notion color), `snake_hex` (any color, e.g. `ff6b9d`), `speed`, `bar` (smooth/steps/none), `bar_shape` (auto/rounded/square/segments/dots/line/levels), `stats`, `lang`, `source` (live = animated in the browser from public contributions; generated = SVG built daily on deploy for the repo owner by `scripts/snake-outputs.mjs`). |
| Weather | `widgets/weather/` | `city` (`Sobradinho, DF`, `Paris, US`... or `demo`), `label`, `region`, `style` (classic/hero/glass/bento/chart/sun/list/minimal/strip/terminal), `units` (c/f), `days` (3/5/7), `details`, `animate`, `link` (panel/google/windy/none: clicking a day opens an hourly panel inside the widget, or an external page outside Notion), `lang`, `lat` + `lon`. Data from Open-Meteo (free, no API key), cached for 30 min. |
| GitHub | `widgets/github/` | `user` (or `demo`), `mode` (profile/repos/stats/langs), `style` (card/neofetch), `repo` (owner/name), `count` (number or `all`), `forks`, `sort` (updated/stars), `lang`. Most used languages (`mode=langs`): `layout` (compact/donut/bars/terminal/pie/chips), `top`, `hide` (e.g. `Jupyter Notebook,HTML`), `by` (bytes/repos), `sample` (recent repos counted), `title` (`-` hides). Click a repo card for a details panel (languages, last commits, copy `git clone`). Public GitHub API, no token, cached for 1 hour. |

Every widget also accepts `theme` (dark/light), `accent` (Notion colors or `mono` for black/white/gray) and `bg` (transparent/card/page).

## Edit an embed later
- **Inside Notion:** hover a widget and click **✎** (bottom-right). Change anything and **Save**: it applies right away to that embed on this device. **Copy URL** gives the new link; replace the embed's link in Notion to make it permanent on every device. **Reset to embed** drops the local changes. Hide the pen with `edit=0`.
- **In the Workbench:** paste an existing embed URL in the box at the top and click **Load** to keep editing it.

## Add a new widget
1. Create `widgets/<id>/index.html` pointing to `src/widgets/<id>/main.ts`.
2. Create the Svelte component in `src/widgets/<id>/`.
3. Register it in `src/shared/registry.ts` so the Workbench shows it.

## Deploy
Every push to `main` builds and publishes to `https://the-jonas.github.io/Notion_Widgets/` (GitHub Actions → Pages).
