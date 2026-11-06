(() => {
  "use strict";

  const HOST_ID = "__cleanshelf_host__";
  const STORAGE_KEY = "cleanshelf_snippets";
  const SETTINGS_KEY = "cleanshelf_settings";
  const DRAFT_KEY = "cleanshelf_draft";
  const UNFILED = "Unfiled";
  const DEFAULT_SETTINGS = {
    layout: "grid",
    theme: "dark",
    contrast: "normal",
    fontSize: "md",
  };
  const DRAFT_DEBOUNCE_MS = 400;

  const existing = document.getElementById(HOST_ID);
  if (existing) {
    try { if (typeof existing.__csCleanup === "function") existing.__csCleanup(); } catch (_) {}
    existing.remove();
    return;
  }

  // --- host + shadow root ---
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText =
    "all:initial;position:fixed;inset:0;z-index:2147483647;display:block;";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "closed" });

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

  --cs-fs-base: 13px;
  --cs-fs-sm: 12px;
  --cs-fs-xs: 11px;
  --cs-fs-2xs: 10px;
  --cs-fs-title: 22px;
  --cs-fs-card-title: 12.5px;
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

:host([data-size="sm"]) {
  --cs-fs-base: 12px;
  --cs-fs-sm: 11px;
  --cs-fs-xs: 10px;
  --cs-fs-2xs: 9px;
  --cs-fs-title: 20px;
  --cs-fs-card-title: 11.5px;
}

:host([data-size="lg"]) {
  --cs-fs-base: 14px;
  --cs-fs-sm: 13px;
  --cs-fs-xs: 12px;
  --cs-fs-2xs: 11px;
  --cs-fs-title: 24px;
  --cs-fs-card-title: 13.5px;
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
  max-height: calc(100vh - 32px);
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

.cs-btn:hover:not(:disabled) { filter: brightness(1.1); }
.cs-btn:disabled { opacity: 0.5; cursor: default; }

.cs-list {
  flex: 1 1 auto;
  min-height: 200px;
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
}

.cs-folder.collapsed .cs-folder-items { display: none; }

.cs-folder-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.cs-options-hint {
  margin: 4px 0 0;
  font-size: var(--cs-fs-xs);
  color: var(--cs-text-dim);
}

.cs-hidden { display: none !important; }

.cs-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  flex-shrink: 0;
}

.cs-footer[hidden] { display: none; }

.cs-hint {
  margin: 10px 0 0;
  font-size: var(--cs-fs-xs);
  color: var(--cs-text-faint);
  text-align: center;
  flex-shrink: 0;
}

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
`;

  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    shadow.adoptedStyleSheets = [sheet];
  } catch (_) {
    const s = document.createElement("style");
    s.textContent = STYLES;
    shadow.appendChild(s);
  }

  // --- DOM helpers ---
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function svgEl(attrs, children) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    for (const k in attrs) svg.setAttribute(k, attrs[k]);
    for (const c of children || []) svg.appendChild(c);
    return svg;
  }

  function makeFolderIcon() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z");
    return svgEl({
      viewBox: "0 0 24 24", width: "32", height: "32",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
      "class": "cs-folder-icon",
    }, [path]);
  }

  function makeGearIcon() {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "3");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z");
    return svgEl({
      viewBox: "0 0 24 24", width: "16", height: "16",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
    }, [circle, path]);
  }

  function makeDraftIcons() {
    const ns = "http://www.w3.org/2000/svg";
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", "6");
    dot.setAttribute("cy", "6");
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "currentColor");
    const dotIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      "class": "cs-draft-icon cs-draft-icon-dot",
    }, [dot]);

    const checkPath = document.createElementNS(ns, "path");
    checkPath.setAttribute("d", "M2 6.5l2.5 2.5L10 3");
    const checkIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round",
      "class": "cs-draft-icon cs-draft-icon-check",
    }, [checkPath]);

    const errPath1 = document.createElementNS(ns, "path");
    errPath1.setAttribute("d", "M6 2v4.5");
    const errPath2 = document.createElementNS(ns, "circle");
    errPath2.setAttribute("cx", "6");
    errPath2.setAttribute("cy", "9");
    errPath2.setAttribute("r", "0.9");
    errPath2.setAttribute("fill", "currentColor");
    const errIcon = svgEl({
      viewBox: "0 0 12 12", width: "12", height: "12",
      fill: "none", stroke: "currentColor",
      "stroke-width": "1.8", "stroke-linecap": "round",
      "class": "cs-draft-icon cs-draft-icon-error",
    }, [errPath1, errPath2]);

    return { dotIcon, checkIcon, errIcon };
  }

  // --- state ---
  const state = {
    view: "main",
    settings: { ...DEFAULT_SETTINGS },
    drilledFolder: null,
    lastError: null,
    lastErrorAt: null,
    collapsedFolders: new Set(),
    snippets: [],
    draftTimer: null,
  };

  // --- build UI ---
  const backdrop = el("div", "cs-backdrop");
  const card = el("div", "cs-card");
  backdrop.appendChild(card);
  shadow.appendChild(backdrop);

  const toast = el("div", "cs-toast");
  toast.hidden = true;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  shadow.appendChild(toast);

  // header
  const header = el("header", "cs-header");
  const headerText = el("div", "cs-header-text");
  headerText.appendChild(el("h1", "cs-title", "CleanShelf"));
  headerText.appendChild(el("p", "cs-preview", "Save, folder, and copy your code snippets locally."));
  header.appendChild(headerText);
  card.appendChild(header);

  // --- MAIN VIEW ---
  const mainView = el("div", "cs-view");
  mainView.dataset.view = "main";

  const addSection = el("div", "cs-section");
  const inputHeader = el("div", "cs-input-header");
  inputHeader.appendChild(el("label", "cs-label", "New snippet"));

  const draftIndicator = el("span", "cs-draft-indicator");
  draftIndicator.dataset.state = "idle";
  const { dotIcon, checkIcon, errIcon } = makeDraftIcons();
  draftIndicator.appendChild(dotIcon);
  draftIndicator.appendChild(checkIcon);
  draftIndicator.appendChild(errIcon);
  draftIndicator.appendChild(el("span", "cs-draft-text", "Draft"));
  inputHeader.appendChild(draftIndicator);

  addSection.appendChild(inputHeader);

  const fieldRow = el("div", "cs-field-row");
  const titleInput = el("input", "cs-input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  const folderInput = el("input", "cs-input cs-input-folder");
  folderInput.type = "text";
  folderInput.placeholder = "Folder";
  folderInput.setAttribute("list", "cs-folder-list");
  fieldRow.appendChild(titleInput);
  fieldRow.appendChild(folderInput);
  const folderDatalist = document.createElement("datalist");
  folderDatalist.id = "cs-folder-list";
  addSection.appendChild(fieldRow);
  const contentInput = el("textarea", "cs-textarea");
  contentInput.placeholder = "Paste your snippet here…";
  addSection.appendChild(contentInput);
  const saveBtn = el("button", "cs-btn", "Save");
  saveBtn.type = "button";
  addSection.appendChild(saveBtn);
  mainView.appendChild(addSection);
  mainView.appendChild(folderDatalist);

  const listSection = el("div", "cs-section cs-section-list");
  listSection.appendChild(el("label", "cs-label", "Your snippets"));
  const listEl = el("div", "cs-list");
  listSection.appendChild(listEl);
  mainView.appendChild(listSection);
  card.appendChild(mainView);

  // --- OPTIONS VIEW ---
  const optionsView = el("div", "cs-options-view");
  optionsView.dataset.view = "options";
  optionsView.hidden = true;

  const optionsHeader = el("div", "cs-options-header");
  const optionsBack = el("button", "cs-back-btn", "← Back");
  optionsBack.type = "button";
  optionsHeader.appendChild(optionsBack);
  optionsHeader.appendChild(el("h2", "cs-options-title", "Options"));
  optionsView.appendChild(optionsHeader);

  const optionsBody = el("div", "cs-options-body");

  function buildRadioGroup(title, name, options) {
    const group = el("div", "cs-options-group");
    group.appendChild(el("label", "cs-label", title));
    const inputs = {};
    for (const opt of options) {
      const wrap = el("label", "cs-option-radio");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = opt.value;
      input.addEventListener("change", () => {
        if (input.checked) opt.onSelect(opt.value);
      });
      wrap.appendChild(input);
      wrap.appendChild(el("span", null, opt.label));
      group.appendChild(wrap);
      inputs[opt.value] = input;
    }
    return { group, inputs };
  }

  function applySettingsToDom() {
    host.dataset.theme = state.settings.theme;
    host.dataset.contrast = state.settings.contrast;
    host.dataset.size = state.settings.fontSize;
  }

  async function persistSettings() {
    try {
      await chrome.storage.local.set({ [SETTINGS_KEY]: { ...state.settings } });
    } catch (err) {
      recordError("settings/save", err);
    }
  }

  const layoutGroup = buildRadioGroup("Layout", "cs-layout", [
    { value: "grid", label: "Folder grid (icons, 3 columns)", onSelect: (v) => setLayout(v) },
    { value: "list", label: "List (grouped by folder)", onSelect: (v) => setLayout(v) },
  ]);
  optionsBody.appendChild(layoutGroup.group);

  const themeGroup = buildRadioGroup("Color scheme", "cs-theme", [
    { value: "dark", label: "Dark", onSelect: (v) => setTheme(v) },
    { value: "light", label: "Light", onSelect: (v) => setTheme(v) },
  ]);
  optionsBody.appendChild(themeGroup.group);

  const contrastGroup = buildRadioGroup("Contrast", "cs-contrast", [
    { value: "normal", label: "Normal", onSelect: (v) => setContrast(v) },
    { value: "high", label: "High", onSelect: (v) => setContrast(v) },
  ]);
  optionsBody.appendChild(contrastGroup.group);

  const fontSizeGroup = buildRadioGroup("Font size", "cs-fontsize", [
    { value: "sm", label: "Small", onSelect: (v) => setFontSize(v) },
    { value: "md", label: "Medium", onSelect: (v) => setFontSize(v) },
    { value: "lg", label: "Large", onSelect: (v) => setFontSize(v) },
  ]);
  optionsBody.appendChild(fontSizeGroup.group);

  const dataGroup = el("div", "cs-options-group");
  dataGroup.appendChild(el("label", "cs-label", "Data"));
  const exportBtn = el("button", "cs-btn cs-option-action", "Export JSON");
  exportBtn.type = "button";
  const importBtn = el("button", "cs-btn cs-option-action cs-option-secondary", "Import JSON");
  importBtn.type = "button";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.className = "cs-hidden";
  dataGroup.appendChild(exportBtn);
  dataGroup.appendChild(importBtn);
  dataGroup.appendChild(fileInput);
  dataGroup.appendChild(el("p", "cs-options-hint", "Export downloads all snippets. Import replaces all snippets."));
  optionsBody.appendChild(dataGroup);

  optionsView.appendChild(optionsBody);
  card.appendChild(optionsView);

  // hint
  card.appendChild(el("p", "cs-hint", "Data stays in your browser. No tracking. No network calls."));

  // footer (debug + gear)
  const footer = el("div", "cs-footer");
  const btnDebug = el("button", "cs-debug-toggle", "Debug ▾");
  btnDebug.type = "button";
  const btnGear = el("button", "cs-gear");
  btnGear.type = "button";
  btnGear.setAttribute("aria-label", "Options");
  btnGear.appendChild(makeGearIcon());
  footer.appendChild(btnDebug);
  footer.appendChild(btnGear);
  card.appendChild(footer);

  // debug panel
  const debugPanel = el("div", "cs-debug-panel");
  debugPanel.hidden = true;

  const lastErrorRow = el("div", "cs-debug-row");
  lastErrorRow.appendChild(el("span", "cs-debug-key", "Last Error:"));
  const dbgLastError = el("span", "cs-debug-val", "none");
  lastErrorRow.appendChild(dbgLastError);
  debugPanel.appendChild(lastErrorRow);

  const checkRow = el("div", "cs-debug-row");
  checkRow.appendChild(el("span", "cs-debug-key", "Checkup:"));
  const dbgRunChecks = el("button", "cs-debug-btn", "Run steps");
  dbgRunChecks.type = "button";
  checkRow.appendChild(dbgRunChecks);
  debugPanel.appendChild(checkRow);

  const dbgSteps = el("ul", "cs-debug-steps");
  debugPanel.appendChild(dbgSteps);
  card.appendChild(debugPanel);

  // --- storage helpers ---
  function recordError(where, err) {
    const msg = err && err.message ? err.message : String(err);
    state.lastError = `${where}: ${msg}`;
    state.lastErrorAt = new Date().toISOString();
    console.error(`CleanShelf [${where}]`, err);
    dbgLastError.textContent = `${state.lastError} @ ${state.lastErrorAt}`;
  }

  async function getSnippets() {
    const res = await chrome.storage.local.get(STORAGE_KEY);
    const list = res[STORAGE_KEY];
    return Array.isArray(list) ? list : [];
  }

  async function saveSnippets(list) {
    await chrome.storage.local.set({ [STORAGE_KEY]: list });
  }

  async function getSettings() {
    try {
      const res = await chrome.storage.local.get(SETTINGS_KEY);
      const s = res[SETTINGS_KEY] || {};
      return {
        layout: s.layout === "list" ? "list" : "grid",
        theme: s.theme === "light" ? "light" : "dark",
        contrast: s.contrast === "high" ? "high" : "normal",
        fontSize: s.fontSize === "sm" ? "sm" : s.fontSize === "lg" ? "lg" : "md",
      };
    } catch (_) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function showToast(message, variant) {
    toast.textContent = message;
    toast.dataset.variant = variant || "success";
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
      host.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
      if (!ok) throw new Error("clipboard write failed");
    }
  }

  async function copySnippet(snippet) {
    const text = snippet && snippet.content ? snippet.content : "";
    if (!text) { showToast("Nothing to copy", "error"); return; }
    try {
      await copyText(text);
      showToast("Copied to clipboard");
    } catch (err) {
      recordError("clipboard", err);
      showToast("Copy failed", "error");
    }
  }

  // --- draft ---
  function setDraftState(s) {
    draftIndicator.dataset.state = s;
  }

  function currentDraft() {
    return {
      title: titleInput.value,
      folder: folderInput.value,
      content: contentInput.value,
      updatedAt: Date.now(),
    };
  }

  function isDraftEmpty(d) {
    return !d.title && !d.folder && !d.content;
  }

  async function persistDraft() {
    state.draftTimer = null;
    const draft = currentDraft();
    if (isDraftEmpty(draft)) {
      try {
        await chrome.storage.local.remove(DRAFT_KEY);
        setDraftState("idle");
      } catch (err) {
        recordError("draft/clear", err);
        setDraftState("error");
      }
      return;
    }
    try {
      await chrome.storage.local.set({ [DRAFT_KEY]: draft });
      setDraftState("saved");
    } catch (err) {
      recordError("draft/save", err);
      setDraftState("error");
    }
  }

  function scheduleDraft() {
    setDraftState("dirty");
    clearTimeout(state.draftTimer);
    state.draftTimer = setTimeout(persistDraft, DRAFT_DEBOUNCE_MS);
  }

  function flushDraft() {
    if (state.draftTimer == null) return;
    clearTimeout(state.draftTimer);
    state.draftTimer = null;
    const draft = currentDraft();
    if (isDraftEmpty(draft)) return;
    chrome.storage.local.set({ [DRAFT_KEY]: draft }).catch(() => {});
  }

  async function loadDraft() {
    try {
      const res = await chrome.storage.local.get(DRAFT_KEY);
      const draft = res[DRAFT_KEY];
      if (!draft || isDraftEmpty(draft)) {
        setDraftState("idle");
        return;
      }
      titleInput.value = typeof draft.title === "string" ? draft.title : "";
      folderInput.value = typeof draft.folder === "string" ? draft.folder : "";
      contentInput.value = typeof draft.content === "string" ? draft.content : "";
      setDraftState("saved");
    } catch (err) {
      recordError("draft/load", err);
      setDraftState("error");
    }
  }

  async function clearDraft() {
    clearTimeout(state.draftTimer);
    state.draftTimer = null;
    try {
      await chrome.storage.local.remove(DRAFT_KEY);
      setDraftState("idle");
    } catch (err) {
      recordError("draft/clear", err);
    }
  }

  titleInput.addEventListener("input", scheduleDraft);
  folderInput.addEventListener("input", scheduleDraft);
  contentInput.addEventListener("input", scheduleDraft);

  // --- rendering ---
  function groupByFolder(snippets) {
    const map = new Map();
    for (const s of snippets) {
      const key = (s && s.folder) ? s.folder : UNFILED;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    const names = [...map.keys()].filter((k) => k !== UNFILED).sort();
    if (map.has(UNFILED)) names.push(UNFILED);
    return names.map((name) => ({ name, items: map.get(name) }));
  }

  function renderFolderList(snippets) {
    const folders = new Set();
    for (const s of snippets) if (s && s.folder) folders.add(s.folder);
    folderDatalist.innerHTML = "";
    for (const f of [...folders].sort()) {
      const opt = document.createElement("option");
      opt.value = f;
      folderDatalist.appendChild(opt);
    }
  }

  function buildSnippetCard(snippet) {
    const cardEl = el("div", "cs-item");
    cardEl.setAttribute("role", "button");
    cardEl.setAttribute("tabindex", "0");
    cardEl.title = "Click to copy";
    cardEl.appendChild(el("div", "cs-item-title", snippet.title || "Untitled"));
    cardEl.appendChild(el("p", "cs-item-content", snippet.content || ""));
    cardEl.appendChild(el("span", "cs-item-copy", "Copy"));
    cardEl.addEventListener("click", () => copySnippet(snippet));
    cardEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copySnippet(snippet);
      }
    });
    return cardEl;
  }

  function renderListView() {
    listEl.innerHTML = "";
    const snippets = state.snippets || [];
    if (snippets.length === 0) {
      listEl.appendChild(el("p", "cs-empty", "No snippets yet."));
      return;
    }
    const frag = document.createDocumentFragment();
    for (const group of groupByFolder(snippets)) {
      const wrap = el("section", "cs-folder");
      if (state.collapsedFolders.has(group.name)) wrap.classList.add("collapsed");

      const headerBtn = el("button", "cs-folder-header");
      headerBtn.type = "button";
      headerBtn.appendChild(el("span", "cs-folder-caret",
        state.collapsedFolders.has(group.name) ? "▸" : "▾"));
      headerBtn.appendChild(el("span", null, group.name));
      headerBtn.appendChild(el("span", "cs-folder-count", String(group.items.length)));
      headerBtn.addEventListener("click", () => {
        if (state.collapsedFolders.has(group.name)) state.collapsedFolders.delete(group.name);
        else state.collapsedFolders.add(group.name);
        renderSnippets();
      });

      const items = el("div", "cs-folder-items");
      const ordered = group.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      for (const s of ordered) items.appendChild(buildSnippetCard(s));

      wrap.appendChild(headerBtn);
      wrap.appendChild(items);
      frag.appendChild(wrap);
    }
    listEl.appendChild(frag);
  }

  function renderGridView() {
    listEl.innerHTML = "";
    const snippets = state.snippets || [];
    const groups = groupByFolder(snippets);

    if (state.drilledFolder !== null) {
      const group = groups.find((g) => g.name === state.drilledFolder);
      if (!group) {
        state.drilledFolder = null;
        return renderGridView();
      }

      const drillHeader = el("div", "cs-drill-header");
      const backBtn = el("button", "cs-back-btn", "← Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", () => {
        state.drilledFolder = null;
        renderSnippets();
      });
      drillHeader.appendChild(backBtn);
      drillHeader.appendChild(el("span", "cs-drill-title", group.name));
      drillHeader.appendChild(el("span", "cs-drill-count", String(group.items.length)));
      listEl.appendChild(drillHeader);

      const items = el("div", "cs-drill-items");
      const ordered = group.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      for (const s of ordered) items.appendChild(buildSnippetCard(s));
      listEl.appendChild(items);
      return;
    }

    if (groups.length === 0) {
      listEl.appendChild(el("p", "cs-empty", "No snippets yet."));
      return;
    }

    const grid = el("div", "cs-folder-grid");
    for (const group of groups) {
      const tile = el("button", "cs-folder-tile");
      tile.type = "button";
      tile.appendChild(makeFolderIcon());
      tile.appendChild(el("div", "cs-folder-tile-name", group.name));
      tile.appendChild(el("div", "cs-folder-tile-count", String(group.items.length)));
      tile.addEventListener("click", () => {
        state.drilledFolder = group.name;
        renderSnippets();
      });
      grid.appendChild(tile);
    }
    listEl.appendChild(grid);
  }

  function renderSnippets() {
    if (state.settings.layout === "grid") renderGridView();
    else renderListView();
  }

  // --- data ops ---
  async function loadSnippets() {
    try {
      const snippets = await getSnippets();
      state.snippets = snippets;
      renderFolderList(snippets);
      renderSnippets();
      return snippets;
    } catch (err) {
      recordError("load", err);
      listEl.innerHTML = "";
      const p = el("p", "cs-empty", "Could not load snippets. Open Debug.");
      p.style.color = "var(--cs-error)";
      listEl.appendChild(p);
      return null;
    }
  }

  async function handleSave() {
    const title = titleInput.value.trim();
    const folder = folderInput.value.trim();
    const content = contentInput.value.trim();
    if (!title && !content) {
      recordError("save", new Error("Both title and content are empty"));
      showToast("Add a title or content", "error");
      return;
    }
    saveBtn.disabled = true;
    try {
      const snippets = await getSnippets();
      snippets.push({
        id: crypto.randomUUID(),
        title,
        folder: folder || "",
        content,
        createdAt: Date.now(),
      });
      await saveSnippets(snippets);
      titleInput.value = "";
      folderInput.value = "";
      contentInput.value = "";
      await clearDraft();
      await loadSnippets();
      showToast("Saved");
    } catch (err) {
      recordError("save", err);
      showToast("Save failed", "error");
    } finally {
      saveBtn.disabled = false;
    }
  }
  saveBtn.addEventListener("click", handleSave);

  // --- view transitions ---
  function showMain() {
    state.view = "main";
    mainView.hidden = false;
    optionsView.hidden = true;
    footer.hidden = false;
    titleInput.focus();
  }

  function showOptions() {
    state.view = "options";
    mainView.hidden = true;
    optionsView.hidden = false;
    footer.hidden = true;
    syncOptionRadios();
    optionsBack.focus();
  }

  optionsBack.addEventListener("click", showMain);
  btnGear.addEventListener("click", showOptions);

  // --- settings ---
  function syncOptionRadios() {
    layoutGroup.inputs.grid.checked = state.settings.layout === "grid";
    layoutGroup.inputs.list.checked = state.settings.layout === "list";
    themeGroup.inputs.dark.checked = state.settings.theme === "dark";
    themeGroup.inputs.light.checked = state.settings.theme === "light";
    contrastGroup.inputs.normal.checked = state.settings.contrast === "normal";
    contrastGroup.inputs.high.checked = state.settings.contrast === "high";
    fontSizeGroup.inputs.sm.checked = state.settings.fontSize === "sm";
    fontSizeGroup.inputs.md.checked = state.settings.fontSize === "md";
    fontSizeGroup.inputs.lg.checked = state.settings.fontSize === "lg";
  }

  function setLayout(layout) {
    if (layout !== "grid" && layout !== "list") return;
    if (state.settings.layout === layout) return;
    state.settings.layout = layout;
    state.drilledFolder = null;
    renderSnippets();
    persistSettings();
  }

  function setTheme(theme) {
    if (theme !== "dark" && theme !== "light") return;
    if (state.settings.theme === theme) return;
    state.settings.theme = theme;
    applySettingsToDom();
    persistSettings();
  }

  function setContrast(contrast) {
    if (contrast !== "normal" && contrast !== "high") return;
    if (state.settings.contrast === contrast) return;
    state.settings.contrast = contrast;
    applySettingsToDom();
    persistSettings();
  }

  function setFontSize(size) {
    if (size !== "sm" && size !== "md" && size !== "lg") return;
    if (state.settings.fontSize === size) return;
    state.settings.fontSize = size;
    applySettingsToDom();
    persistSettings();
  }

  // --- export / import ---
  function exportSnippets() {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        snippets: state.snippets || [],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cleanshelf-${Date.now()}.json`;
      a.style.display = "none";
      host.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Exported ${(state.snippets || []).length} snippets`);
    } catch (err) {
      recordError("export", err);
      showToast("Export failed", "error");
    }
  }
  exportBtn.addEventListener("click", exportSnippets);

  importBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || !Array.isArray(data.snippets)) {
          throw new Error("invalid file: missing snippets array");
        }
        const normalized = data.snippets.map((s) => ({
          id: (s && typeof s.id === "string" && s.id) ? s.id : crypto.randomUUID(),
          title: (s && typeof s.title === "string") ? s.title : "",
          folder: (s && typeof s.folder === "string") ? s.folder : "",
          content: (s && typeof s.content === "string") ? s.content : "",
          createdAt: (s && typeof s.createdAt === "number") ? s.createdAt : Date.now(),
        }));
        const current = (state.snippets || []).length;
        const ok = confirm(`Replace ${current} snippet${current === 1 ? "" : "s"} with ${normalized.length} from file?`);
        if (!ok) return;
        await saveSnippets(normalized);
        state.drilledFolder = null;
        await loadSnippets();
        showToast(`Imported ${normalized.length} snippets`);
      } catch (err) {
        recordError("import", err);
        showToast("Import failed", "error");
      }
    };
    reader.onerror = (err) => {
      recordError("import/read", err);
      showToast("Import read failed", "error");
    };
    reader.readAsText(file);
  });

  // --- debug ---
  const checks = [
    {
      name: "storage.local API",
      fn: () => {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
          throw new Error("chrome.storage.local unavailable");
        }
      },
    },
    {
      name: "storage round-trip",
      fn: async () => {
        const k = "__cleanshelf_check__";
        const v = Date.now();
        await chrome.storage.local.set({ [k]: v });
        const out = await chrome.storage.local.get(k);
        await chrome.storage.local.remove(k);
        if (out[k] !== v) throw new Error("read-back mismatch");
      },
    },
    {
      name: "snippets readable",
      fn: async () => {
        const list = await getSnippets();
        if (!Array.isArray(list)) throw new Error("not an array");
        return `${list.length} items`;
      },
    },
    {
      name: "settings readable",
      fn: async () => {
        const s = await getSettings();
        if (!["grid", "list"].includes(s.layout)) throw new Error("layout: " + s.layout);
        if (!["dark", "light"].includes(s.theme)) throw new Error("theme: " + s.theme);
        if (!["normal", "high"].includes(s.contrast)) throw new Error("contrast: " + s.contrast);
        if (!["sm", "md", "lg"].includes(s.fontSize)) throw new Error("fontSize: " + s.fontSize);
        return `${s.layout}/${s.theme}/${s.contrast}/${s.fontSize}`;
      },
    },
    {
      name: "draft round-trip",
      fn: async () => {
        const k = "__cleanshelf_draft_check__";
        const v = { title: "t", folder: "f", content: "c", updatedAt: 1 };
        await chrome.storage.local.set({ [k]: v });
        const out = await chrome.storage.local.get(k);
        await chrome.storage.local.remove(k);
        if (!out[k] || out[k].title !== "t") throw new Error("draft round-trip failed");
      },
    },
    {
      name: "clipboard API",
      fn: () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          throw new Error("navigator.clipboard.writeText missing");
        }
      },
    },
    {
      name: "crypto.randomUUID",
      fn: () => {
        if (typeof crypto.randomUUID !== "function") {
          throw new Error("crypto.randomUUID missing");
        }
      },
    },
    {
      name: "DOM refs bound",
      fn: () => {
        const missing = [];
        if (!titleInput) missing.push("title");
        if (!folderInput) missing.push("folder");
        if (!contentInput) missing.push("content");
        if (!saveBtn) missing.push("save");
        if (!listEl) missing.push("list");
        if (!mainView) missing.push("mainView");
        if (!optionsView) missing.push("optionsView");
        if (!fileInput) missing.push("fileInput");
        if (!btnGear) missing.push("gear");
        if (!draftIndicator) missing.push("draftIndicator");
        if (!toast) missing.push("toast");
        if (missing.length) throw new Error("missing: " + missing.join(", "));
      },
    },
    {
      name: "view functions",
      fn: () => {
        if (typeof renderSnippets !== "function") throw new Error("renderSnippets missing");
        if (typeof renderGridView !== "function") throw new Error("renderGridView missing");
        if (typeof renderListView !== "function") throw new Error("renderListView missing");
        if (typeof exportSnippets !== "function") throw new Error("exportSnippets missing");
        if (typeof persistDraft !== "function") throw new Error("persistDraft missing");
      },
    },
  ];

  function renderCheckRow(check) {
    const li = el("li", "cs-debug-step");
    const status = el("span", "cs-debug-step-status");
    const name = el("span", "cs-debug-step-name", check.name);
    const detail = el("span", "cs-debug-step-detail");
    li.appendChild(status);
    li.appendChild(name);
    li.appendChild(detail);
    return { li, status, detail };
  }

  async function runChecks() {
    dbgSteps.innerHTML = "";
    dbgRunChecks.disabled = true;

    const rows = checks.map((c) => {
      const row = renderCheckRow(c);
      row.li.classList.add("cs-debug-step-run");
      row.status.textContent = "RUN";
      dbgSteps.appendChild(row.li);
      return row;
    });

    let failed = 0;
    for (let i = 0; i < checks.length; i++) {
      const c = checks[i];
      const row = rows[i];
      try {
        const out = await c.fn();
        row.li.classList.remove("cs-debug-step-run");
        row.li.classList.add("cs-debug-step-pass");
        row.status.textContent = "PASS";
        row.detail.textContent = out || "";
      } catch (err) {
        failed++;
        row.li.classList.remove("cs-debug-step-run");
        row.li.classList.add("cs-debug-step-fail");
        row.status.textContent = "FAIL";
        row.detail.textContent = err && err.message ? err.message : String(err);
      }
    }

    dbgRunChecks.disabled = false;
    showToast(
      failed === 0 ? "All checks passed" : `${failed} check${failed === 1 ? "" : "s"} failed`,
      failed === 0 ? "success" : "error"
    );
  }
  dbgRunChecks.addEventListener("click", runChecks);

  btnDebug.addEventListener("click", () => {
    const opening = debugPanel.hidden;
    debugPanel.hidden = !opening;
    btnDebug.textContent = opening ? "Debug ▴" : "Debug ▾";
  });

  // --- lifecycle ---
  function close() {
    flushDraft();
    host.__csCleanup();
    host.remove();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  const ac = new AbortController();
  document.addEventListener("keydown", onKey, { capture: true, signal: ac.signal });
  host.__csCleanup = () => {
    try { ac.abort(); } catch (_) {}
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  // --- init ---
  (async () => {
    try {
      const settings = await getSettings();
      state.settings = settings;
    } catch (err) {
      recordError("settings/load", err);
    }
    applySettingsToDom();
    syncOptionRadios();
    await loadDraft();
    await loadSnippets();
    titleInput.focus();
  })();
})();