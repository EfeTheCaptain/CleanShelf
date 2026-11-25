# CleanShelf Improvement Specification

## Project Overview
CleanShelf is a Chrome/Brave/Edge extension (Manifest V3) that provides an in-page overlay for saving, organizing, and copying code snippets. It uses a closed Shadow DOM for style isolation, chrome.storage.local for persistence, and injects its overlay via `chrome.scripting.executeScript` on user gesture.

## Current Architecture
- **Background**: Service worker (`background.js`) handles toolbar click and keyboard shortcut (`Ctrl/Cmd+Shift+K`), injects 15 overlay scripts in order.
- **Overlay Modules** (loaded in dependency order):
  1. `overlay-constants.js` - Constants, singleton guard
  2. `overlay-dom.js` - DOM helpers, SVG icons
  3. `overlay-styles.js` - All CSS as string, applied via adoptedStyleSheets
  4. `overlay-i18n.js` - EN/TR translations, locale-aware search
  5. `overlay-state.js` - Global state factory, error recording
  6. `overlay-storage.js` - chrome.storage.local wrapper
  7. `overlay-toast.js` - Toast notifications with undo actions
  8. `overlay-clipboard.js` - Clipboard write with fallback
  9. `overlay-drafts.js` - Debounced draft auto-save
  10. `overlay-snippets.js` - Core logic (folders, subfolders, drag-drop, render)
  11. `overlay-options.js` - Settings UI (layout, theme, contrast, font, language, draft rate, export/import)
  12. `overlay-debug.js` - Debug panel with 10 health checks
  13. `overlay-export-import.js` - JSON export/import (replace/merge)
  14. `overlay-index.js` - Entry point: builds UI, wires events, bootstraps

## Identified Issues

### Security
1. **No Content Security Policy** in manifest - extension runs without CSP protection
2. **Potential XSS in i18n** - `overlay-i18n.js:299-302` uses `innerHTML` for `data-i18n-html` elements. Translations are hardcoded but this pattern is risky if translations ever come from storage.
3. **Singleton guard side-effect** - `overlay-constants.js` sets `globalThis.CleanShelf = { aborted: true }` on collision, which could leave stale state.

### Code Quality & Maintainability
4. **Duplicate dark-sepia theme** - `overlay-styles.js` defines dark-sepia twice (lines 128-148 and 239-259)
5. **Large monolithic files** - `overlay-snippets.js` (1340 lines), `overlay-index.js` (632 lines), `overlay-styles.js` (1198 lines)
6. **No TypeScript / type definitions** - All vanilla JS, no JSDoc types for module interfaces
7. **No linting/formatting config** - No ESLint, Prettier, or style guide
8. **No build step** - 15 separate script files injected at runtime; concatenation would reduce injection overhead
9. **No automated tests** - Zero test coverage

### Bugs / Edge Cases
10. **Missing optional chaining** - `overlay-i18n.js:276` accesses `CS.state.settings.language` without guards; crashes if i18n loads before state init
11. **Inconsistent error handling** - Some storage calls lack try/catch, others use `CS.recordError`
12. **Drag-drop scroll bug fixed but fragile** - Manual scroll in `overlay-index.js:120-129` only works for list panel

### Performance
13. **Full re-render on every change** - `renderSnippets()` rebuilds entire DOM
14. **No virtualization** - Large snippet lists (1000+) will degrade
15. **CSS as single string** - Parsed on every injection

### UX / Accessibility
16. **No keyboard navigation** - Arrow keys, Home/End not supported in snippet lists
17. **No search highlighting** - Matching text not highlighted in results
18. **Focus management gaps** - Focus not always restored correctly after actions

## Improvement Goals (Non-Breaking)
All changes must preserve existing user-facing behavior: UI, workflows, outputs, compatibility, shortcuts, storage format, and observable behavior.

### Phase 1: Security & Critical Fixes
- Add CSP to manifest
- Fix i18n innerHTML XSS vector (sanitize or use textContent)
- Fix optional chaining in i18n
- Clean up singleton guard logic

### Phase 2: Code Quality & Tooling
- Remove duplicate dark-sepia theme
- Add ESLint + Prettier config
- Add TypeScript declaration files (.d.ts) for module interfaces
- Add JSDoc types to existing JS
- Add build script to concatenate overlay files (optional, for development)

### Phase 3: Maintainability
- Split `overlay-snippets.js` into logical modules (render, folders, drag-drop, persistence)
- Split `overlay-index.js` into UI construction, event wiring, lifecycle
- Extract CSS into separate .css files with build-time concatenation
- Add unit tests for storage, i18n, draft, clipboard, export/import modules

### Phase 4: Performance & UX (Optional)
- Add virtualization for snippet lists
- Add keyboard navigation (arrow keys)
- Add search result highlighting
- Optimize re-renders with targeted DOM updates

## Acceptance Criteria
- Extension loads and functions identically to v1.2.8
- All existing features work: folders, subfolders, drag-drop, undo, export/import, drafts, themes, search, debug panel
- No console errors in normal operation
- CSP does not break any functionality
- Build step (if added) produces identical concatenated output
- Tests pass for covered modules

## Out of Scope
- Changing storage schema or migration
- Adding new user-facing features
- Changing UI/UX beyond bug fixes
- Rewriting in TypeScript (declarations only)
- Framework adoption (React, Vue, etc.)