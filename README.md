# CleanShelf

A Chrome extension (Manifest V3) that lets you save, search, and copy code snippets locally in your browser. No analytics, no tracking, no network calls.

## Features

- Save snippets with title, content, and optional labels
- Search snippets by title or content
- Copy snippet content to clipboard with one click
- Export/import data as JSON
- Blurred popup UI on launch
- Keyboard shortcut: `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac)

## Files

- `manifest.json` — extension manifest (MV3), permissions, commands
- `background.js` — service worker, handles keyboard shortcut only
- `popup.html` — popup UI structure
- `popup.css` — popup styles
- `popup.js` — popup logic (storage read/write, rendering, debug panel)
- `icons/` — extension icons

## Privacy

All data is stored locally via `chrome.storage.local`. No data is sent to any server. No analytics, no tracking.

## Setup

1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select this folder
5. Click the extension icon or press `Ctrl+Shift+K`
