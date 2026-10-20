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
| Clock | `widgets/clock/` | `format` (24/12), `seconds`, `date`, `lang` |

Every widget also accepts `theme` (dark/light), `accent` (Notion colors) and `bg` (transparent/card/page).

## Add a new widget
1. Create `widgets/<id>/index.html` pointing to `src/widgets/<id>/main.ts`.
2. Create the Svelte component in `src/widgets/<id>/`.
3. Register it in `src/shared/registry.ts` so the Workbench shows it.

## Deploy
Every push to `main` builds and publishes to `https://the-jonas.github.io/Notion_Widgets/` (GitHub Actions → Pages).
