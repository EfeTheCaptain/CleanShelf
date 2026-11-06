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
