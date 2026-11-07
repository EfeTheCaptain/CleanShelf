(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  const STYLES = `
* { box-sizing: border-box; }

:host {
  --cs-backdrop: rgba(5, 5, 10, 0.55);
  --cs-bg-card: #14141c;
  --cs-bg-panel: #0f0f16;
  --cs-bg-surface: #1b1b24;
  --cs-bg-surface-hover: #1f1f2b;
  --cs-bg-elevated: #17171f;
  --cs-bg-elevated-hover: #1c1c27;
  --cs-bg-chip: #2a2a3a;
  --cs-border: #23232e;
  --cs-border-strong: #2f2f3d;
  --cs-border-hover: #3b3b52;
  --cs-text: #e5e7eb;
  --cs-text-strong: #f9fafb;
  --cs-text-title: #f3f4f6;
  --cs-text-muted: #94a3b8;
  --cs-text-dim: #6b7280;
  --cs-text-faint: #4b5563;
  --cs-accent: #6366f1;
  --cs-accent-strong: #4f46e5;
  --cs-success: #10b981;
  --cs-error: #ef4444;

  --cs-fs-base: 18px;
  --cs-fs-sm: 16px;
  --cs-fs-xs: 14px;
  --cs-fs-2xs: 12px;
  --cs-fs-title: 32px;
  --cs-fs-card-title: 18px;
}

:host([data-theme="light"]) {
  --cs-backdrop: rgba(15, 23, 42, 0.35);
  --cs-bg-card: #ffffff;
  --cs-bg-panel: #f9fafb;
  --cs-bg-surface: #f3f4f6;
  --cs-bg-surface-hover: #e5e7eb;
  --cs-bg-elevated: #f3f4f6;
  --cs-bg-elevated-hover: #e5e7eb;
  --cs-bg-chip: #e5e7eb;
  --cs-border: #e5e7eb;
  --cs-border-strong: #d1d5db;
  --cs-border-hover: #9ca3af;
  --cs-text: #111827;
  --cs-text-strong: #030712;
  --cs-text-title: #111827;
  --cs-text-muted: #4b5563;
  --cs-text-dim: #6b7280;
  --cs-text-faint: #9ca3af;
  --cs-accent: #4f46e5;
  --cs-accent-strong: #4338ca;
}

:host([data-theme="dracula"]) {
  --cs-backdrop: rgba(40, 42, 54, 0.85);
  --cs-bg-card: #282a36;
  --cs-bg-panel: #21222c;
  --cs-bg-surface: #44475a;
  --cs-bg-surface-hover: #6272a4;
  --cs-bg-elevated: #44475a;
  --cs-bg-elevated-hover: #6272a4;
  --cs-bg-chip: #44475a;
  --cs-border: #44475a;
  --cs-border-strong: #6272a4;
  --cs-border-hover: #bd93f9;
  --cs-text: #f8f8f2;
  --cs-text-strong: #ffffff;
  --cs-text-title: #f8f8f2;
  --cs-text-muted: #f8f8f2;
  --cs-text-dim: #9ea4c1;
  --cs-text-faint: #6272a4;
  --cs-accent: #bd93f9;
  --cs-accent-strong: #ff79c6;
}

:host([data-theme="nord"]) {
  --cs-backdrop: rgba(46, 52, 64, 0.85);
  --cs-bg-card: #2e3440;
  --cs-bg-panel: #242933;
  --cs-bg-surface: #3b4252;
  --cs-bg-surface-hover: #434c5e;
  --cs-bg-elevated: #3b4252;
  --cs-bg-elevated-hover: #434c5e;
  --cs-bg-chip: #4c566a;
  --cs-border: #3b4252;
  --cs-border-strong: #4c566a;
  --cs-border-hover: #88c0d0;
  --cs-text: #eceff4;
  --cs-text-strong: #ffffff;
  --cs-text-title: #eceff4;
  --cs-text-muted: #d8dee9;
  --cs-text-dim: #81a1c1;
  --cs-text-faint: #4c566a;
  --cs-accent: #88c0d0;
  --cs-accent-strong: #8fbcbb;
}

:host([data-theme="sepia"]) {
  --cs-backdrop: rgba(244, 236, 216, 0.5);
  --cs-bg-card: #fdf6e3;
  --cs-bg-panel: #eee8d5;
  --cs-bg-surface: #f4ecd8;
  --cs-bg-surface-hover: #e6dfca;
  --cs-bg-elevated: #eee8d5;
  --cs-bg-elevated-hover: #e6dfca;
  --cs-bg-chip: #d5ccb6;
  --cs-border: #d5ccb6;
  --cs-border-strong: #c0b69e;
  --cs-border-hover: #b58900;
  --cs-text: #5b4636;
  --cs-text-strong: #2c231b;
  --cs-text-title: #2c231b;
  --cs-text-muted: #8a7661;
  --cs-text-dim: #6b5745;
  --cs-text-faint: #a69583;
  --cs-accent: #b58900;
  --cs-accent-strong: #cb4b16;
}

:host([data-theme="dark-sepia"]) {
  --cs-backdrop: rgba(20, 16, 14, 0.85);
  --cs-bg-card: #241c18;
  --cs-bg-panel: #1a1411;
  --cs-bg-surface: #2e241f;
  --cs-bg-surface-hover: #382c26;
  --cs-bg-elevated: #2e241f;
  --cs-bg-elevated-hover: #382c26;
  --cs-bg-chip: #4a3c33;
  --cs-border: #3a2d26;
  --cs-border-strong: #4a3c33;
  --cs-border-hover: #d68c45;
  --cs-text: #e8d8c8;
  --cs-text-strong: #fdf6e3;
  --cs-text-title: #fdf6e3;
  --cs-text-muted: #c4b5a5;
  --cs-text-dim: #9a8878;
  --cs-text-faint: #6b5a4d;
  --cs-accent: #d68c45;
  --cs-accent-strong: #c07333;
}

:host([data-contrast="high"]) {
  --cs-text: #ffffff;
  --cs-text-strong: #ffffff;
  --cs-text-title: #ffffff;
  --cs-text-muted: #e5e7eb;
  --cs-text-dim: #cbd5e1;
  --cs-text-faint: #94a3b8;
  --cs-border: #4b5563;
  --cs-border-strong: #6b7280;
  --cs-border-hover: #9ca3af;
  --cs-accent: #818cf8;
  --cs-accent-strong: #6366f1;
}

:host([data-theme="light"][data-contrast="high"]) {
  --cs-text: #000000;
  --cs-text-strong: #000000;
  --cs-text-title: #000000;
  --cs-text-muted: #111827;
  --cs-text-dim: #374151;
  --cs-text-faint: #6b7280;
  --cs-border: #6b7280;
  --cs-border-strong: #374151;
  --cs-accent: #4338ca;
  --cs-accent-strong: #3730a3;
}

:host([data-theme="dracula"][data-contrast="high"]) {
  --cs-text: #ffffff;
  --cs-text-strong: #ffffff;
  --cs-text-title: #ffffff;
  --cs-text-muted: #ffffff;
  --cs-border: #bd93f9;
  --cs-border-strong: #ff79c6;
  --cs-bg-panel: #191a21;
  --cs-bg-card: #21222c;
}

:host([data-theme="nord"][data-contrast="high"]) {
  --cs-text: #ffffff;
  --cs-text-strong: #ffffff;
  --cs-text-title: #ffffff;
  --cs-text-muted: #ffffff;
  --cs-border: #88c0d0;
  --cs-border-strong: #8fbcbb;
  --cs-bg-panel: #20252e;
  --cs-bg-card: #2a303c;
}

:host([data-theme="sepia"][data-contrast="high"]) {
  --cs-text: #000000;
  --cs-text-strong: #000000;
  --cs-text-title: #000000;
  --cs-text-muted: #111111;
  --cs-border: #5b4636;
  --cs-border-strong: #2c231b;
  --cs-bg-panel: #f4ecd8;
  --cs-bg-card: #ffffff;
}

:host([data-theme="dark-sepia"][data-contrast="high"]) {
  --cs-text: #ffffff;
  --cs-text-strong: #ffffff;
  --cs-text-title: #ffffff;
  --cs-text-muted: #ffffff;
  --cs-border: #d68c45;
  --cs-border-strong: #f0a35e;
  --cs-bg-panel: #140f0d;
  --cs-bg-card: #1f1612;
}

:host([data-size="sm"]) {
  --cs-fs-base: 11px;
  --cs-fs-sm: 10px;
  --cs-fs-xs: 9px;
  --cs-fs-2xs: 8px;
  --cs-fs-title: 18px;
  --cs-fs-card-title: 11px;
}

:host([data-size="lg"]) {
  --cs-fs-base: 24px;
  --cs-fs-sm: 20px;
  --cs-fs-xs: 18px;
  --cs-fs-2xs: 16px;
  --cs-fs-title: 42px;
  --cs-fs-card-title: 24px;
}

:host([data-theme="dark-sepia"]) {
  --cs-backdrop: rgba(20, 16, 14, 0.85);
  --cs-bg-card: #241c18;
  --cs-bg-panel: #1a1411;
  --cs-bg-surface: #2e241f;
  --cs-bg-surface-hover: #382c26;
  --cs-bg-elevated: #2e241f;
  --cs-bg-elevated-hover: #382c26;
  --cs-bg-chip: #4a3c33;
  --cs-border: #3a2d26;
  --cs-border-strong: #4a3c33;
  --cs-border-hover: #d68c45;
  --cs-text: #e8d8c8;
  --cs-text-strong: #fdf6e3;
  --cs-text-title: #fdf6e3;
  --cs-text-muted: #c4b5a5;
  --cs-text-dim: #9a8878;
  --cs-text-faint: #6b5a4d;
  --cs-accent: #d68c45;
  --cs-accent-strong: #c07333;
}

.cs-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--cs-backdrop);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--cs-text);
  animation: cs-fade 0.15s ease-out;
}

.cs-card {
  position: relative;
  width: 100%;
  max-width: 1280px;
  height: calc(100vh - 100px);
  padding: 24px;
  background: var(--cs-bg-card);
  border: 1px solid var(--cs-border);
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cs-rise 0.18s ease-out;
  font-size: var(--cs-fs-base);
}

.cs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.cs-header-text { min-width: 0; }

.cs-title {
  margin: 0 0 6px;
  font-size: var(--cs-fs-title);
  font-weight: 700;
  color: var(--cs-text-strong);
  letter-spacing: 0.2px;
}

.cs-preview { margin: 0; font-size: var(--cs-fs-base); color: var(--cs-text-muted); }

.cs-view {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.cs-view[hidden] { display: none; }

.cs-search-row {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.cs-main-layout {
  display: grid;
  grid-template-columns: minmax(280px, 35%) 1fr;
  gap: 20px;
  flex: 1 1 auto;
  min-height: 0;
}

.cs-left-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.cs-right-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--cs-bg-panel);
  border: 1px solid var(--cs-border);
  border-radius: 10px;
  padding: 16px;
}

.cs-right-panel .cs-input-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--cs-border);
}

.cs-right-panel .cs-field-row { margin-bottom: 12px; }

.cs-right-panel .cs-textarea {
  flex: 1 1 auto;
  min-height: 150px;
  margin-bottom: 12px;
}

.cs-right-panel .cs-btn-row { margin-top: 0; }

.cs-section { margin-bottom: 14px; }

.cs-section-list {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 0;
}

.cs-input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.cs-input-header .cs-label { margin-bottom: 0; }

.cs-label {
  display: block;
  font-size: var(--cs-fs-xs);
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--cs-text-dim);
  margin-bottom: 6px;
}

.cs-draft-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--cs-fs-2xs);
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  color: var(--cs-text-dim);
  opacity: 0;
  transition: opacity 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.cs-draft-indicator[data-state="dirty"],
.cs-draft-indicator[data-state="saved"],
.cs-draft-indicator[data-state="error"] { opacity: 1; }

.cs-draft-indicator[data-state="saved"] { color: var(--cs-success); }
.cs-draft-indicator[data-state="dirty"] { color: var(--cs-text-muted); }
.cs-draft-indicator[data-state="error"] { color: var(--cs-error); }

.cs-draft-icon { width: 12px; height: 12px; flex-shrink: 0; }

.cs-draft-icon-dot,
.cs-draft-icon-check,
.cs-draft-icon-error { display: none; }

.cs-draft-indicator[data-state="dirty"] .cs-draft-icon-dot { display: inline-block; }
.cs-draft-indicator[data-state="saved"] .cs-draft-icon-check { display: inline-block; }
.cs-draft-indicator[data-state="error"] .cs-draft-icon-error { display: inline-block; }

.cs-draft-indicator[data-state="dirty"] .cs-draft-icon-dot {
  animation: cs-pulse 1s ease-in-out infinite;
}

.cs-draft-text { display: none; }
.cs-draft-indicator[data-state="saved"] .cs-draft-text { display: inline; }

.cs-field-row { display: flex; gap: 8px; margin-bottom: 8px; }

.cs-input,
.cs-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--cs-bg-surface);
  border: 1px solid var(--cs-border-strong);
  border-radius: 8px;
  color: var(--cs-text);
  font-size: var(--cs-fs-base);
  font-family: inherit;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.cs-input-folder { max-width: 160px; }

.cs-input::placeholder,
.cs-textarea::placeholder { color: var(--cs-text-faint); }

.cs-input:focus,
.cs-textarea:focus {
  outline: none;
  border-color: var(--cs-accent);
  background: var(--cs-bg-surface-hover);
}

.cs-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.cs-btn-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.cs-btn {
  margin-top: 8px;
  padding: 9px 16px;
  background: linear-gradient(180deg, var(--cs-accent), var(--cs-accent-strong));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: var(--cs-fs-base);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.cs-btn-row .cs-btn { margin-top: 0; }

.cs-btn:hover:not(:disabled) { filter: brightness(1.1); }
.cs-btn:disabled { opacity: 0.5; cursor: default; }

.cs-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 6px;
  background: var(--cs-bg-panel);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
}

.cs-folder { margin-bottom: 8px; }
.cs-folder:last-child { margin-bottom: 0; }

.cs-folder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  color: var(--cs-text-muted);
  font-size: var(--cs-fs-xs);
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  text-align: left;
}

.cs-folder-header:hover { background: var(--cs-bg-elevated-hover); }
.cs-folder-caret { width: 10px; color: var(--cs-text-dim); }

.cs-folder-count {
  margin-left: auto;
  padding: 1px 8px;
  background: var(--cs-bg-chip);
  border-radius: 999px;
  color: var(--cs-text-muted);
  font-size: var(--cs-fs-2xs);
}

.cs-folder-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  padding-top: 8px;
  align-content: start;
}

.cs-folder.collapsed .cs-folder-items { display: none; }

.cs-folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 2px;
}

.cs-folder-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 10px;
  color: var(--cs-text-muted);
  font-family: inherit;
  font-size: var(--cs-fs-card-title);
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, transform 0.05s ease;
  text-align: center;
  min-height: 118px;
}

.cs-folder-tile:hover { background: var(--cs-bg-elevated-hover); border-color: var(--cs-border-hover); color: var(--cs-text-title); }
.cs-folder-tile:active { transform: scale(0.99); }
.cs-folder-tile:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 1px; }

.cs-folder-icon { color: var(--cs-accent); flex-shrink: 0; }

.cs-folder-tile-name {
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cs-folder-tile-count {
  padding: 1px 8px;
  background: var(--cs-bg-chip);
  border-radius: 999px;
  font-size: var(--cs-fs-2xs);
  color: var(--cs-text-muted);
}

.cs-drill-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 10px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--cs-border);
}

.cs-drill-title {
  font-size: var(--cs-fs-base);
  font-weight: 700;
  color: var(--cs-text-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cs-drill-count {
  margin-left: auto;
  padding: 1px 8px;
  background: var(--cs-bg-chip);
  border-radius: 999px;
  font-size: var(--cs-fs-2xs);
  color: var(--cs-text-muted);
}

.cs-back-btn {
  padding: 4px 10px;
  background: var(--cs-bg-chip);
  color: var(--cs-text);
  border: 1px solid var(--cs-border-strong);
  border-radius: 6px;
  font-size: var(--cs-fs-xs);
  font-family: inherit;
  cursor: pointer;
}

.cs-back-btn:hover { background: var(--cs-border-strong); }

.cs-drill-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  align-content: start;
}

.cs-item {
  position: relative;
  padding: 10px 12px;
  background: var(--cs-bg-card);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
  font-size: var(--cs-fs-card-title);
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, transform 0.05s ease;
}

.cs-item:hover { background: var(--cs-bg-elevated); border-color: var(--cs-border-hover); }
.cs-item:active { transform: scale(0.995); }
.cs-item:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 1px; }

.cs-item-title {
  margin: 0 0 4px;
  font-weight: 600;
  color: var(--cs-text-title);
}

.cs-item-content {
  margin: 0;
  color: var(--cs-text-dim);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cs-fs-sm);
  max-height: 80px;
  overflow: hidden;
}

.cs-item-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: var(--cs-bg-chip);
  border: 1px solid var(--cs-border-strong);
  border-radius: 999px;
  color: var(--cs-text-muted);
  font-size: var(--cs-fs-2xs);
  opacity: 0;
  transition: opacity 0.12s ease;
  pointer-events: none;
}

.cs-item:hover .cs-item-copy { opacity: 1; }

.cs-empty {
  margin: 0;
  padding: 24px 8px;
  color: var(--cs-text-faint);
  font-size: var(--cs-fs-sm);
  text-align: center;
}

.cs-options-view {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.cs-options-view[hidden] { display: none; }

.cs-options-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.cs-options-title {
  margin: 0;
  font-size: calc(var(--cs-fs-title) - 6px);
  font-weight: 700;
  color: var(--cs-text-strong);
}

.cs-options-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.cs-options-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cs-options-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--cs-bg-panel);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
}

.cs-option-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--cs-bg-card);
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--cs-fs-base);
  color: var(--cs-text);
  transition: border-color 0.12s ease, background 0.12s ease;
}

.cs-option-radio:hover { background: var(--cs-bg-elevated); border-color: var(--cs-border-hover); }

.cs-option-radio input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  margin: 0;
  border-radius: 999px;
  border: 2px solid var(--cs-text-dim);
  background: transparent;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.cs-option-radio input[type="radio"]:checked { border-color: var(--cs-accent); }

.cs-option-radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 999px;
  background: var(--cs-accent);
}

.cs-option-action { margin-top: 0; }

.cs-option-secondary {
  background: var(--cs-bg-chip);
  color: var(--cs-text);
}

.cs-option-secondary:hover:not(:disabled) { background: var(--cs-border-strong); filter: none; }

.cs-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  flex-shrink: 0;
}

.cs-footer[hidden] { display: none; }

.cs-tips-panel {
  position: fixed;
  z-index: 100;
  width: 340px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cs-tips-panel[hidden] { display: none; }

.cs-tips-header {
  font-weight: 700;
  font-size: var(--cs-fs-base);
  color: var(--cs-text-strong);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--cs-border);
}

.cs-tips-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cs-tip {
  font-size: var(--cs-fs-sm);
  color: var(--cs-text-muted);
  line-height: 1.4;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.cs-tip::before {
  content: "•";
  color: var(--cs-accent);
  font-weight: bold;
}

.cs-tip strong {
  color: var(--cs-text);
}

.cs-tip.cs-tip-warning {
  color: var(--cs-text);
  background: rgba(239, 68, 68, 0.1);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.cs-tip.cs-tip-warning::before {
  content: "⚠";
  color: var(--cs-error);
}

.cs-hidden { display: none !important; }

.cs-debug-toggle {
  padding: 7px 12px;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  font-size: var(--cs-fs-xs);
  font-family: inherit;
  color: var(--cs-text-muted);
  cursor: pointer;
  user-select: none;
}

.cs-debug-toggle:hover { background: var(--cs-bg-elevated-hover); }

.cs-gear {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  color: var(--cs-text-muted);
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.cs-gear:hover { background: var(--cs-bg-elevated-hover); color: var(--cs-text-title); }

.cs-debug-panel {
  margin-top: 8px;
  padding: 12px;
  background: var(--cs-bg-panel);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
  font-size: var(--cs-fs-xs);
  color: var(--cs-text-muted);
  flex-shrink: 0;
  max-height: 240px;
  overflow-y: auto;
}

.cs-debug-panel[hidden] { display: none; }

.cs-debug-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: flex-start; }

.cs-debug-key {
  font-weight: 600;
  width: 90px;
  color: var(--cs-text-muted);
  flex-shrink: 0;
}

.cs-debug-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
  color: var(--cs-text);
}

.cs-debug-btn {
  padding: 4px 10px;
  background: var(--cs-bg-chip);
  color: var(--cs-text);
  border: 1px solid var(--cs-border-strong);
  border-radius: 5px;
  font-size: var(--cs-fs-xs);
  font-family: inherit;
  cursor: pointer;
}

.cs-debug-btn:hover { background: var(--cs-border-strong); }
.cs-debug-btn:disabled { opacity: 0.5; cursor: default; }

.cs-debug-steps {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cs-debug-step {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 4px 6px;
  background: var(--cs-bg-card);
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--cs-fs-xs);
}

.cs-debug-step-status { flex-shrink: 0; width: 44px; font-weight: 700; }
.cs-debug-step-pass .cs-debug-step-status { color: var(--cs-success); }
.cs-debug-step-fail .cs-debug-step-status { color: var(--cs-error); }
.cs-debug-step-run  .cs-debug-step-status { color: #f59e0b; }
.cs-debug-step-name { color: var(--cs-text-muted); }
.cs-debug-step-detail { color: var(--cs-text-dim); margin-left: auto; text-align: right; }

.cs-context-menu {
  position: fixed;
  z-index: 100;
  min-width: 120px;
  padding: 4px;
  background: var(--cs-bg-elevated);
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.cs-context-menu[hidden] { display: none; }

.cs-context-item {
  padding: 6px 10px;
  background: transparent;
  border: none;
  text-align: left;
  font-family: inherit;
  font-size: var(--cs-fs-sm);
  color: var(--cs-text);
  border-radius: 4px;
  cursor: pointer;
}

.cs-context-item:hover { background: var(--cs-bg-chip); }
.cs-context-item.cs-danger { color: var(--cs-error); }

.cs-toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: var(--cs-success);
  color: #062b1e;
  font-size: var(--cs-fs-sm);
  font-weight: 600;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
  animation: cs-toast-in 0.18s ease-out;
  z-index: 10;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.cs-toast[data-variant="error"] {
  background: var(--cs-error);
  color: #2b0606;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
}

.cs-toast[hidden] { display: none; }

@keyframes cs-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cs-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cs-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes cs-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.cs-item { position: relative; }
.cs-item[draggable="true"] { cursor: grab; }
.cs-item.cs-dragging { opacity: 0.4; cursor: grabbing; }

.cs-folder-tile.cs-drag-over,
.cs-folder-header.cs-drag-over {
  border-color: var(--cs-accent) !important;
  background: var(--cs-bg-surface-hover) !important;
  box-shadow: 0 0 0 2px var(--cs-accent);
}

.cs-item-time {
  display: block;
  margin-top: 6px;
  font-size: var(--cs-fs-2xs);
  color: var(--cs-text-faint);
  text-align: right;
}

.cs-toast {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: auto;
}

.cs-toast-action {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: inherit;
  font-family: inherit;
  font-size: var(--cs-fs-xs);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.1s;
}

.cs-toast-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

.cs-drill-header .cs-back-btn.cs-ctx-btn {
  margin-left: 8px;
  padding: 2px 8px;
  font-weight: bold;
}

.cs-drill-items.cs-compact .cs-item-content,
.cs-drill-items.cs-compact .cs-item-time {
  display: none;
}

.cs-drill-items.cs-compact .cs-item {
  padding: 8px 12px;
  min-height: auto;
}

.cs-item.cs-subfolder {
  background: var(--cs-bg-panel);
  border: 1px dashed var(--cs-border-strong);
  color: var(--cs-text-muted);
  cursor: grab;
  padding: 10px 12px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: var(--cs-fs-xs);
  letter-spacing: 1px;
  margin-top: 12px;
}

.cs-item.cs-subfolder:hover {
  background: var(--cs-bg-surface);
  color: var(--cs-text);
}

.cs-item.cs-subfolder .cs-item-copy {
  display: none !important;
}

.cs-item.cs-subfolder.cs-drop-target {
  border-color: var(--cs-accent) !important;
  background: var(--cs-bg-surface-hover) !important;
}

.cs-subfolder-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  padding: 4px 0 12px 16px;
  border-left: 2px solid var(--cs-border-strong);
  margin-left: 6px;
}

/* Drag and drop reordering indicator */
.cs-item.cs-drop-target {
  border-top: 3px solid var(--cs-accent) !important;
  padding-top: 9px !important;
}

`;

  function applyStyles(shadowRoot) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(STYLES);
      shadowRoot.adoptedStyleSheets = [sheet];
    } catch (_) {
      const s = document.createElement("style");
      s.textContent = STYLES;
      shadowRoot.appendChild(s);
    }
  }

  CS.styles = { STYLES, applyStyles };
})();