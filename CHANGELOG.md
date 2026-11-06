# Changelog

## v0.1.1

- Initial release of CleanShelf (cleaned from SnippetVault 0.5.0)
- Removed Google Analytics telemetry and all network calls
- Removed side panel; replaced with blurred popup UI
- Popup reads/writes `chrome.storage.local` directly (no service-worker messages for snippets)
- Service worker handles keyboard shortcut only (`Ctrl+Shift+K`)
- Debug panel inside popup (Extension ID, URL, storage raw, counters, self-test)
- DocumentFragment-based rendering with textContent (no innerHTML injection)
- No icons block in manifest (avoids 404s)
