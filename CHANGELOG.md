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
