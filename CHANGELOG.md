## v0.1.10

- Right panel becomes editor (New or Edit mode); left panel holds "Your snippets"
- Textarea fills available vertical height
- Right-click → Edit changes panel title to "Edit snippet", button to "Update", shows "Cancel" button, focuses textarea
- Cancel or successful Update resets right panel to "New snippet" mode
- startEdit/cancelEdit/handleSave updated in overlay-snippets.js

## v0.1.9

- Right panel becomes the editor (New or Edit mode); left panel holds "Your snippets"
- Textarea stretches to fill available vertical space
- Main view changed to 2-column grid layout (35% left / 65% right)
- `.cs-list` min-height removed (stretches to fill)
- `.cs-folder-grid` narrowed for left column (auto-fill, minmax 120px)

## v0.1.8

- `.cs-folder-items` and `.cs-drill-items` changed from flex column to CSS grid (`repeat(auto-fill, minmax(320px, 1fr))`) for multi-column card layout
- `align-content: start` packs cards at top of container

## v0.1.7

- CSS variables: all theme-visible colors and font-size tokens are `--cs-*` custom properties on `:host`
- Theme toggle: Dark / Light (light overrides card, panel, surface, elevated, border, text tokens; backdrop lightens to rgba(15,23,42,0.35))
- Contrast toggle: Normal / High (strengthens text, borders, accent; combined light+high rule)
- Font size toggle: Small / Medium / Large (adjusts --cs-fs-base, --cs-fs-sm, --cs-fs-xs, --cs-fs-2xs, --cs-fs-title, --cs-fs-card-title)
- Draft system: debounced 400ms write to `cleanshelf_draft` in chrome.storage.local; restored on init; cleared on save; flushed synchronously on close via `flushDraft()`
- Draft indicator: icon + "Draft" text next to "New snippet" label (idle/dirty/saved/error states via data-state)
- Options extended: three new radio groups (Color scheme, Contrast, Font size) below Layout, above Data
- Settings persisted under `cleanshelf_settings` with four fields (layout, theme, contrast, fontSize); getSettings normalizes all fields
- Debug checks: settings readable validates all four fields; draft round-trip added; DOM refs includes draftIndicator
- `all: initial` preserved on host (does not reset custom properties)

## v0.1.6

- CSS variables: all theme-visible colors and font-size tokens are `--cs-*` custom properties on `:host`
- Theme toggle: Dark / Light (light overrides card, panel, surface, elevated, border, text tokens; backdrop lightens to rgba(15,23,42,0.35))
- Contrast toggle: Normal / High (strengthens text, borders, accent; combined light+high rule)
- Font size toggle: Small / Medium / Large (adjusts --cs-fs-base, --cs-fs-sm, --cs-fs-xs, --cs-fs-2xs, --cs-fs-title, --cs-fs-card-title)
- Draft system: debounced 400ms write to `cleanshelf_draft` in chrome.storage.local; restored on init; cleared on save; flushed synchronously on close via `flushDraft()`
- Draft indicator: icon + "Draft" text next to "New snippet" label (idle/dirty/saved/error states via data-state)
- Options extended: three new radio groups (Color scheme, Contrast, Font size) below Layout, above Data
- Settings persisted under `cleanshelf_settings` with four fields (layout, theme, contrast, fontSize); getSettings normalizes all fields
- Debug checks: settings readable validates all four fields; draft round-trip added; DOM refs includes draftIndicator
- `all: initial` preserved on host (does not reset custom properties)

## v0.1.5

- Two layout modes: grid (default, 3-column folder-tile grid with drill-in) and list (grouped-collapsible, unchanged)
- Folder grid: click tile → drill into folder's snippets; Back returns to grid
- Gear icon in footer opens Options view (layout radio, Export/Import JSON, hint)
- Options replaces main view; Back returns; gear/debug footer hidden in Options
- Export: anchor + Blob → downloads `cleanshelf-<ts>.json` with `{ version: 1, exportedAt, snippets }`
- Import: file picker, validates snippets array, normalizes items, confirm() gate before replacing
- Card max-width: 1280px (was 1000), backdrop padding 16px, max-height: calc(100vh - 32px)
- Settings persisted under `cleanshelf_settings` in chrome.storage.local, loaded on init
- Debug checks: 9 steps (added "settings readable"; "tabs wired" → "view functions"; DOM refs updated)
- `drilledFolder` reset on layout change, import, and when folder no longer exists after save
- No manifest changes (no new permissions)

## v0.1.4

- Replaced popup window with in-page overlay (shadow DOM, closed mode)
- Overlay injected on demand via `chrome.scripting.executeScript` on user gesture
- Backdrop `rgba(5,5,10,0.55)` + `backdrop-filter: blur(10px)` over live page
- Card centered in tab viewport, max-width 1000px
- Toggle: re-invoking toolbar/shortcut closes existing overlay
- ESC (capture + stopPropagation) and backdrop-click close the overlay
- `AbortController` cleans up keydown listener — no leak
- Clipboard: `navigator.clipboard.writeText` with `execCommand` fallback
- CSS injected via `CSSStyleSheet` + `adoptedStyleSheets` with `<style>` fallback
- `activeTab` + `scripting` permissions replace host permissions (no `<all_urls>`)
- Injection fails on chrome://, chrome-extension://, Web Store, PDFs (logged warning)
- Deleted popup.html, popup.css, popup.js (no longer referenced)
- 8-step checkup inside overlay debug panel

## v0.1.3

- Removed `default_popup` from manifest; toolbar icon now opens a centered 960×720 chromeless window via `chrome.action.onClicked`
- Keyboard shortcut (`Ctrl/Cmd+Shift+K`) calls the same `openWindow()` handler
- Reopening from toolbar focuses existing window instead of spawning duplicates
- Snippets / Folders tab bar in popup (Snippets tab = add form + grouped list; Folders tab = sidebar + snippet cards)
- Card fills window height (max-height: calc(100vh - 48px), max-width: 1100px)
- Debug panel: removed Extension ID, Popup URL, Chrome Version, Snippet Count, Background rows; kept Last Error and Checkup
- Checkup expanded to 8 steps (added "tabs wired" and "render functions")
- Dark theme only

## v0.1.2

- Dark theme UI (indigo accent, dark background)
- Folder grouping: snippets stored with flat folder string, empty → "Unfiled"
- Collapse state per folder held in memory per popup session
- Click or Enter/Space on a snippet copies content to clipboard with toast feedback
- Added `clipboardWrite` permission
- Debug panel redesigned: removed Extension ID, Popup URL, Chrome Version, Snippet Count, Background rows; kept Last Error and Checkup
- Embedded 7-step checkup (storage API, round-trip, snippets readable, clipboard, crypto.randomUUID, DOM refs, render function) with PASS/FAIL inline
- Popup reads/writes `chrome.storage.local` directly; no service-worker messages
- Service worker handles keyboard shortcut only (`Ctrl/Cmd+Shift+K`)
- `clipboardWrite` added to manifest permissions

## v0.1.1

- Initial release of CleanShelf (cleaned from SnippetVault 0.5.0)
- Removed Google Analytics telemetry and all network calls
- Removed side panel; replaced with blurred popup UI
- Popup reads/writes `chrome.storage.local` directly (no service-worker messages for snippets)
- Service worker handles keyboard shortcut only (`Ctrl+Shift+K`)
- Debug panel inside popup (Extension ID, URL, storage raw, counters, self-test)
- DocumentFragment-based rendering with textContent (no innerHTML injection)
- No icons block in manifest (avoids 404s)
