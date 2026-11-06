(() => {
  "use strict";

  const HOST_ID = "__cleanshelf_host__";
  const STORAGE_KEY = "cleanshelf_snippets";
  const UNFILED = "Unfiled";

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

.cs-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(5, 5, 10, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #e5e7eb;
  animation: cs-fade 0.15s ease-out;
}

.cs-card {
  position: relative;
  width: 100%;
  max-width: 1000px;
  max-height: calc(100vh - 48px);
  padding: 24px;
  background: #14141c;
  border: 1px solid #23232e;
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cs-rise 0.18s ease-out;
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
  font-size: 22px;
  font-weight: 700;
  color: #f9fafb;
  letter-spacing: 0.2px;
}

.cs-preview { margin: 0; font-size: 13px; color: #94a3b8; }

.cs-tabs { display: flex; gap: 4px; flex-shrink: 0; }

.cs-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid #23232e;
  color: #94a3b8;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.cs-tab.is-active { background: #23232e; color: #f9fafb; border-color: #3b3b52; }
.cs-tab:hover:not(.is-active) { background: #1a1a24; }

.cs-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.cs-panel[hidden] { display: none; }

.cs-section { margin-bottom: 14px; }

.cs-section-list {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 0;
}

.cs-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
}

.cs-field-row { display: flex; gap: 8px; margin-bottom: 8px; }

.cs-input,
.cs-textarea {
  width: 100%;
  padding: 10px 12px;
  background: #1b1b24;
  border: 1px solid #2a2a36;
  border-radius: 8px;
  color: #e5e7eb;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.cs-input-folder { max-width: 160px; }

.cs-input::placeholder,
.cs-textarea::placeholder { color: #4b5563; }

.cs-input:focus,
.cs-textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #1f1f2b;
}

.cs-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.cs-btn {
  margin-top: 8px;
  padding: 9px 16px;
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
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
  background: #0f0f16;
  border: 1px solid #23232e;
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
  background: #17171f;
  border: 1px solid #23232e;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  text-align: left;
}

.cs-folder-header:hover { background: #1c1c27; }
.cs-folder-caret { width: 10px; color: #6b7280; }

.cs-folder-count {
  margin-left: auto;
  padding: 1px 8px;
  background: #2a2a3a;
  border-radius: 999px;
  color: #94a3b8;
  font-size: 10px;
}

.cs-folder-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
}

.cs-folder.collapsed .cs-folder-items { display: none; }

.cs-item {
  position: relative;
  padding: 10px 12px;
  background: #14141c;
  border: 1px solid #23232e;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, transform 0.05s ease;
}

.cs-item:hover { background: #191923; border-color: #3b3b52; }
.cs-item:active { transform: scale(0.995); }
.cs-item:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }

.cs-item-title {
  margin: 0 0 4px;
  font-weight: 600;
  color: #f3f4f6;
}

.cs-item-content {
  margin: 0;
  color: #9ca3af;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  max-height: 80px;
  overflow: hidden;
}

.cs-item-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: #23232e;
  border: 1px solid #2f2f3d;
  border-radius: 999px;
  color: #94a3b8;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.12s ease;
  pointer-events: none;
}

.cs-item:hover .cs-item-copy { opacity: 1; }

.cs-empty {
  margin: 0;
  padding: 24px 8px;
  color: #4b5563;
  font-size: 12px;
  text-align: center;
}

.cs-folders-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
}

.cs-folders-sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  padding: 6px;
  background: #0f0f16;
  border: 1px solid #23232e;
  border-radius: 8px;
}

.cs-folder-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.cs-folder-btn:hover { background: #17171f; }

.cs-folder-btn.is-active {
  background: #23232e;
  border-color: #3b3b52;
  color: #f9fafb;
}

.cs-folder-btn-count {
  padding: 1px 8px;
  background: #2a2a3a;
  border-radius: 999px;
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
}

.cs-folders-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding: 6px;
  background: #0f0f16;
  border: 1px solid #23232e;
  border-radius: 8px;
}

.cs-folders-empty {
  margin: 0;
  padding: 24px;
  color: #4b5563;
  font-size: 12px;
  text-align: center;
}

.cs-hint {
  margin: 10px 0 0;
  font-size: 11px;
  color: #4b5563;
  text-align: center;
  flex-shrink: 0;
}

.cs-debug-toggle {
  margin-top: 12px;
  padding: 7px 12px;
  background: #17171f;
  border: 1px solid #23232e;
  border-radius: 6px;
  font-size: 11px;
  font-family: inherit;
  color: #94a3b8;
  cursor: pointer;
  align-self: flex-start;
  user-select: none;
  flex-shrink: 0;
}

.cs-debug-toggle:hover { background: #1c1c27; }

.cs-debug-panel {
  margin-top: 8px;
  padding: 12px;
  background: #0f0f16;
  border: 1px solid #23232e;
  border-radius: 8px;
  font-size: 11px;
  color: #cbd5e1;
  flex-shrink: 0;
  max-height: 240px;
  overflow-y: auto;
}

.cs-debug-panel[hidden] { display: none; }

.cs-debug-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: flex-start; }

.cs-debug-key {
  font-weight: 600;
  width: 90px;
  color: #94a3b8;
  flex-shrink: 0;
}

.cs-debug-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
  color: #e5e7eb;
}

.cs-debug-btn {
  padding: 4px 10px;
  background: #23232e;
  color: #e5e7eb;
  border: 1px solid #2f2f3d;
  border-radius: 5px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
}

.cs-debug-btn:hover { background: #2f2f3d; }
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
  background: #14141c;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.cs-debug-step-status { flex-shrink: 0; width: 44px; font-weight: 700; }
.cs-debug-step-pass .cs-debug-step-status { color: #10b981; }
.cs-debug-step-fail .cs-debug-step-status { color: #ef4444; }
.cs-debug-step-run  .cs-debug-step-status { color: #f59e0b; }
.cs-debug-step-name { color: #cbd5e1; }
.cs-debug-step-detail { color: #6b7280; margin-left: auto; text-align: right; }

.cs-toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: #10b981;
  color: #062b1e;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
  animation: cs-toast-in 0.18s ease-out;
  z-index: 10;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.cs-toast[data-variant="error"] {
  background: #ef4444;
  color: #2b0606;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
}

.cs-toast[hidden] { display: none; }

@keyframes cs-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cs-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cs-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
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

  function buildSnippetCard(snippet) {
    const card = el("div", "cs-item");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.title = "Click to copy";
    card.appendChild(el("div", "cs-item-title", snippet.title || "Untitled"));
    card.appendChild(el("p", "cs-item-content", snippet.content || ""));
    card.appendChild(el("span", "cs-item-copy", "Copy"));
    card.addEventListener("click", () => copySnippet(snippet));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copySnippet(snippet);
      }
    });
    return card;
  }

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
  const tabsNav = el("nav", "cs-tabs");
  tabsNav.setAttribute("role", "tablist");
  const tabSnippets = el("button", "cs-tab is-active", "Snippets");
  tabSnippets.type = "button";
  tabSnippets.dataset.tab = "snippets";
  const tabFolders = el("button", "cs-tab", "Folders");
  tabFolders.type = "button";
  tabFolders.dataset.tab = "folders";
  tabsNav.appendChild(tabSnippets);
  tabsNav.appendChild(tabFolders);
  header.appendChild(headerText);
  header.appendChild(tabsNav);
  card.appendChild(header);

  // snippets panel
  const snippetsPanel = el("section", "cs-panel");
  snippetsPanel.dataset.panel = "snippets";

  const addSection = el("div", "cs-section");
  const addLabel = el("label", "cs-label", "New snippet");
  const titleInput = el("input", "cs-input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  const folderInput = el("input", "cs-input cs-input-folder");
  folderInput.type = "text";
  folderInput.placeholder = "Folder";
  const folderDatalist = document.createElement("datalist");
  folderDatalist.id = "cs-folder-list";
  folderInput.setAttribute("list", "cs-folder-list");
  const fieldRow = el("div", "cs-field-row");
  fieldRow.appendChild(titleInput);
  fieldRow.appendChild(folderInput);
  const contentInput = el("textarea", "cs-textarea");
  contentInput.placeholder = "Paste your snippet here…";
  const saveBtn = el("button", "cs-btn", "Save");
  saveBtn.type = "button";
  addSection.appendChild(addLabel);
  addSection.appendChild(fieldRow);
  addSection.appendChild(contentInput);
  addSection.appendChild(saveBtn);
  snippetsPanel.appendChild(addSection);

  const listSection = el("div", "cs-section cs-section-list");
  listSection.appendChild(el("label", "cs-label", "Your snippets"));
  const listEl = el("div", "cs-list");
  listSection.appendChild(listEl);
  snippetsPanel.appendChild(listSection);
  card.appendChild(snippetsPanel);
  card.appendChild(folderDatalist);

  // folders panel
  const foldersPanel = el("section", "cs-panel");
  foldersPanel.dataset.panel = "folders";
  foldersPanel.hidden = true;
  const foldersLayout = el("div", "cs-folders-layout");
  const folderSidebar = el("aside", "cs-folders-sidebar");
  const folderSnippets = el("div", "cs-folders-main");
  foldersLayout.appendChild(folderSidebar);
  foldersLayout.appendChild(folderSnippets);
  foldersPanel.appendChild(foldersLayout);
  card.appendChild(foldersPanel);

  // hint
  card.appendChild(el("p", "cs-hint", "Data stays in your browser. No tracking. No network calls."));

  // debug
  const btnDebug = el("button", "cs-debug-toggle", "Debug ▾");
  btnDebug.type = "button";
  card.appendChild(btnDebug);

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

  // --- state ---
  const state = {
    lastError: null,
    lastErrorAt: null,
    collapsedFolders: new Set(),
    activeTab: "snippets",
    activeFolder: null,
    snippets: [],
  };

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

  function buildFolder(group) {
    const wrap = el("section", "cs-folder");
    if (state.collapsedFolders.has(group.name)) wrap.classList.add("collapsed");

    const header2 = el("button", "cs-folder-header");
    header2.type = "button";
    header2.appendChild(el("span", "cs-folder-caret",
      state.collapsedFolders.has(group.name) ? "▸" : "▾"));
    header2.appendChild(el("span", null, group.name));
    header2.appendChild(el("span", "cs-folder-count", String(group.items.length)));
    header2.addEventListener("click", () => {
      if (state.collapsedFolders.has(group.name)) state.collapsedFolders.delete(group.name);
      else state.collapsedFolders.add(group.name);
      renderList(state.snippets);
    });

    const items = el("div", "cs-folder-items");
    const ordered = group.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    for (const s of ordered) items.appendChild(buildSnippetCard(s));

    wrap.appendChild(header2);
    wrap.appendChild(items);
    return wrap;
  }

  function renderList(snippets) {
    listEl.innerHTML = "";
    if (!snippets || snippets.length === 0) {
      listEl.appendChild(el("p", "cs-empty", "No snippets yet."));
      return;
    }
    const frag = document.createDocumentFragment();
    for (const group of groupByFolder(snippets)) frag.appendChild(buildFolder(group));
    listEl.appendChild(frag);
    renderFolderList(snippets);
  }

  function renderFoldersTab() {
    const snippets = state.snippets || [];
    const groups = groupByFolder(snippets);

    folderSidebar.innerHTML = "";
    folderSnippets.innerHTML = "";

    if (groups.length === 0) {
      folderSnippets.appendChild(el("p", "cs-folders-empty",
        "No folders yet. Add a snippet with a folder name."));
      return;
    }

    const names = groups.map((g) => g.name);
    if (!state.activeFolder || !names.includes(state.activeFolder)) {
      state.activeFolder = names[0];
    }

    for (const group of groups) {
      const btn = el("button", "cs-folder-btn");
      btn.type = "button";
      if (group.name === state.activeFolder) btn.classList.add("is-active");
      btn.appendChild(el("span", null, group.name));
      btn.appendChild(el("span", "cs-folder-btn-count", String(group.items.length)));
      btn.addEventListener("click", () => {
        state.activeFolder = group.name;
        renderFoldersTab();
      });
      folderSidebar.appendChild(btn);
    }

    const active = groups.find((g) => g.name === state.activeFolder);
    if (!active) return;
    const ordered = active.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    for (const s of ordered) folderSnippets.appendChild(buildSnippetCard(s));
  }

  async function loadSnippets() {
    try {
      const snippets = await getSnippets();
      state.snippets = snippets;
      renderList(snippets);
      if (state.activeTab === "folders") renderFoldersTab();
      return snippets;
    } catch (err) {
      recordError("load", err);
      listEl.innerHTML = "";
      const p = el("p", "cs-empty", "Could not load snippets. Open Debug.");
      p.style.color = "#ef4444";
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

  // --- tabs ---
  const tabButtons = [tabSnippets, tabFolders];
  const tabPanels = [snippetsPanel, foldersPanel];

  function setActiveTab(name) {
    state.activeTab = name;
    for (const b of tabButtons) b.classList.toggle("is-active", b.dataset.tab === name);
    for (const p of tabPanels) p.hidden = p.dataset.panel !== name;
    if (name === "folders") renderFoldersTab();
  }

  for (const b of tabButtons) {
    b.addEventListener("click", () => setActiveTab(b.dataset.tab));
  }

  // --- debug checks ---
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
        if (!folderSidebar) missing.push("folder-sidebar");
        if (!folderSnippets) missing.push("folder-main");
        if (!toast) missing.push("toast");
        if (missing.length) throw new Error("missing: " + missing.join(", "));
      },
    },
    {
      name: "tabs wired",
      fn: () => {
        if (tabButtons.length !== 2) throw new Error(`expected 2 tabs, got ${tabButtons.length}`);
        if (tabPanels.length !== 2) throw new Error(`expected 2 panels, got ${tabPanels.length}`);
      },
    },
    {
      name: "render functions",
      fn: () => {
        if (typeof renderList !== "function") throw new Error("renderList missing");
        if (typeof renderFoldersTab !== "function") throw new Error("renderFoldersTab missing");
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

  // --- initial render ---
  loadSnippets();
  titleInput.focus();
})();