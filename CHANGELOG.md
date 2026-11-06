## v0.1.32

- Added Draft Save Rate option (Fast: 400ms debounce, Relaxed: 2000ms debounce)

## v0.1.31

- Added duplicate title detection on save: replace existing or auto-append (2), (3), etc.

## v0.1.30

- Added "+ Snippet" button in drill view (when inside a folder)
- Clicking it opens an inline title input; pressing Enter populates the Title field and focuses Content

## v0.1.29

- Fixed folder rename: added .cs-drill-title selector so rename works in drill view
- Fixed folder rename: drilledFolder updated when renaming current folder

## v0.1.28

- Added compactView state toggle (Compact / Expand button on drill header)
- Compact view hides content and timestamp, reduces item padding
- Compact CSS class applied to drill-items when active

## v0.1.27

- Added "..." context menu button on drill header (opens folder context menu)
- Added right-click support on drill header to open folder menu directly
- Fixed drill header button alignment CSS

## v0.1.26

- Removed unnecessary recordError call on empty save (keeps Debug panel clean)

## v0.1.25

- Added persistent folders tracked independently of snippets (empty folders remain visible)
- Added "+ Folder" button to left panel to create empty folders explicitly
- Folders persist across sessions via chrome.storage.local (cleanshelf_folders)

## v0.1.24

- Added Drag & Drop snippets onto folder tiles/headers to move between folders
- Added Undo Delete (3.5s toast with Undo button) for snippets and folders
- Added "time ago" timestamp label on snippet cards
- Added draggable visual feedback on snippets and drag-over highlight on folders

## v0.1.23

- Updated toolbar icon to Bookshelf icon (icons/16.png, icons/48.png, icons/128.png)

## v0.1.22

- Updated default font sizes (Medium: 18px base) and Large size scale (24px base) in overlay-styles.js

## v0.1.21

- Added Dracula, Nord, Sepia themes to CleanShelf (alongside Dark and Light)
- Updated storage validation, options UI, syncOptionRadios, setTheme, and debug check for new theme
- Updated font size scale (sm: 11px, lg: 18px)

## v0.1.20

- Fixed Dracula theme: --cs-bg-chip and --cs-text-muted were both #6272a4 (invisible text), now #44475a and #f8f8f2
- Added Dark Sepia theme (warm dark browns with orange accents)
- Updated storage validation, options UI, syncOptionRadios, setTheme, and debug check for new theme

## v0.1.19

- Fixed setTheme guard in overlay-options.js (was hardcoded to only accept dark/light, now accepts all 5 themes)
- Debug check already validated all 5 themes

## v0.1.18

- Added 3 new themes: Dracula, Nord, Sepia (alongside Dark and Light)
- Theme variables for each with distinct color palettes
- Updated getSettings to validate all 5 themes
- Updated options UI with radio buttons for all 5 themes
- Updated debug check to validate new theme values
- Updated font size scale (sm: 11px, lg: 18px)

## v0.1.17

- Card height changed to calc(100vh - 100px) for 50px top/bottom margin
- Backdrop uses align-items: center for perfect vertical centering

## v0.1.16

- Reverted card max-width to fixed 1280px (prevents absurd stretching on ultrawide monitors)
- Card height changed from max-height to fixed height: calc(100vh - 48px) (forces full vertical fill)
- Inside panels use flex: 1 1 auto to stretch to fill

## v0.1.15

- Backdrop and card now fill the screen (max-width: calc(100vw - 48px), max-height: calc(100vh - 48px), padding 24px)
- Draft system respects drilled folder: currentDraft() uses drilledFolder when drilled in
- loadDraft() only restores folder input when not drilled into a folder
- Draft persists the drilled folder name automatically

## v0.1.14

- Back button in drill view auto-cancels edit mode
- Deleting a snippet that is currently being edited auto-cancels edit mode
- Prevents form from staying stuck in "Edit snippet" mode

## v0.1.13

- Updated footnote: three-line hint with tip, privacy notice, and backup warning
- Backup warning bolded and colored brighter (--cs-text-dim)
- Margin increased to 16px for breathing room

## v0.1.12

- Context menu: right-click snippet → Edit/Delete; right-click folder → Rename/Delete
- In-place folder renaming (inline input, Enter saves, Esc cancels)
- Folder collision merging: renaming Folder A to existing Folder B merges snippets
- Folder deletion with confirmation (only asks if folder has snippets)
- Unsaved changes guard on close: confirm dialog "Update or Discard"
- Auto-cancel edit when navigating to Options
- `hasEditChanges()` detects unsaved edits in form
- `originalEditData` tracked during edit for change detection

## v0.1.11

- `originalEditData` added to state (tracks original snippet data during edit)
- Drafts prevented while editing (persistDraft, scheduleDraft, flushDraft, loadDraft all guard on editingSnippetId)
- Draft indicator hidden during edit mode

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
