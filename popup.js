const STORAGE_KEY = "cleanshelf_snippets";
const UNFILED = "Unfiled";

const $ = (id) => document.getElementById(id);

const titleInput = $("snippetTitle");
const folderInput = $("snippetFolder");
const folderList = $("folderList");
const contentInput = $("snippetContent");
const saveBtn = $("btnSave");
const listEl = $("snippetList");
const toastEl = $("toast");
const btnDebug = $("btnDebug");
const debugPanel = $("debugPanel");
const dbgLastError = $("dbgLastError");
const dbgRunChecks = $("dbgRunChecks");
const dbgSteps = $("dbgSteps");

const state = {
  lastError: null,
  lastErrorAt: null,
  collapsedFolders: new Set(),
  snippets: [],
};

function recordError(where, err) {
  const msg = err && err.message ? err.message : String(err);
  state.lastError = `${where}: ${msg}`;
  state.lastErrorAt = new Date().toISOString();
  console.error(`CleanShelf [${where}]`, err);
  if (dbgLastError) {
    dbgLastError.textContent = `${state.lastError} @ ${state.lastErrorAt}`;
  }
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
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.dataset.variant = variant || "success";
  toastEl.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toastEl.hidden = true; }, 1600);
}

async function copySnippet(snippet) {
  const text = snippet && snippet.content ? snippet.content : "";
  if (!text) { showToast("Nothing to copy", "error"); return; }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  } catch (err) {
    recordError("clipboard", err);
    showToast("Copy failed", "error");
  }
}

function renderFolderList(snippets) {
  if (!folderList) return;
  const folders = new Set();
  for (const s of snippets) if (s && s.folder) folders.add(s.folder);
  folderList.innerHTML = "";
  for (const f of [...folders].sort()) {
    const opt = document.createElement("option");
    opt.value = f;
    folderList.appendChild(opt);
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

function buildSnippetCard(snippet) {
  const card = document.createElement("div");
  card.className = "popup-item";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.title = "Click to copy";

  const titleEl = document.createElement("div");
  titleEl.className = "popup-item-title";
  titleEl.textContent = snippet.title || "Untitled";

  const contentEl = document.createElement("p");
  contentEl.className = "popup-item-content";
  contentEl.textContent = snippet.content || "";

  const hint = document.createElement("span");
  hint.className = "popup-item-copy";
  hint.textContent = "Copy";

  card.appendChild(titleEl);
  card.appendChild(contentEl);
  card.appendChild(hint);

  card.addEventListener("click", () => copySnippet(snippet));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copySnippet(snippet);
    }
  });

  return card;
}

function buildFolder(group) {
  const wrap = document.createElement("section");
  wrap.className = "popup-folder";
  if (state.collapsedFolders.has(group.name)) wrap.classList.add("collapsed");

  const header = document.createElement("button");
  header.type = "button";
  header.className = "popup-folder-header";

  const caret = document.createElement("span");
  caret.className = "popup-folder-caret";
  caret.textContent = state.collapsedFolders.has(group.name) ? "▸" : "▾";

  const label = document.createElement("span");
  label.textContent = group.name;

  const count = document.createElement("span");
  count.className = "popup-folder-count";
  count.textContent = String(group.items.length);

  header.appendChild(caret);
  header.appendChild(label);
  header.appendChild(count);

  header.addEventListener("click", () => {
    if (state.collapsedFolders.has(group.name)) {
      state.collapsedFolders.delete(group.name);
    } else {
      state.collapsedFolders.add(group.name);
    }
    renderList(state.snippets);
  });

  const items = document.createElement("div");
  items.className = "popup-folder-items";
  const ordered = group.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  for (const s of ordered) items.appendChild(buildSnippetCard(s));

  wrap.appendChild(header);
  wrap.appendChild(items);
  return wrap;
}

function renderList(snippets) {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!snippets || snippets.length === 0) {
    const p = document.createElement("p");
    p.className = "popup-empty";
    p.textContent = "No snippets yet.";
    listEl.appendChild(p);
    return;
  }
  const frag = document.createDocumentFragment();
  for (const group of groupByFolder(snippets)) frag.appendChild(buildFolder(group));
  listEl.appendChild(frag);
  renderFolderList(snippets);
}

async function loadSnippets() {
  try {
    const snippets = await getSnippets();
    state.snippets = snippets;
    renderList(snippets);
    return snippets;
  } catch (err) {
    recordError("load", err);
    listEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "popup-empty";
    p.style.color = "#ef4444";
    p.textContent = "Could not load snippets. Open Debug.";
    listEl.appendChild(p);
    return null;
  }
}

async function handleSave() {
  const title = titleInput ? titleInput.value.trim() : "";
  const folder = folderInput ? folderInput.value.trim() : "";
  const content = contentInput ? contentInput.value.trim() : "";
  if (!title && !content) {
    recordError("save", new Error("Both title and content are empty"));
    showToast("Add a title or content", "error");
    return;
  }

  if (saveBtn) saveBtn.disabled = true;
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
    if (titleInput) titleInput.value = "";
    if (folderInput) folderInput.value = "";
    if (contentInput) contentInput.value = "";
    await loadSnippets();
    showToast("Saved");
  } catch (err) {
    recordError("save", err);
    showToast("Save failed", "error");
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

if (saveBtn) saveBtn.addEventListener("click", handleSave);

// --- Embedded step checkup ---

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
      if (!titleInput) missing.push("snippetTitle");
      if (!folderInput) missing.push("snippetFolder");
      if (!contentInput) missing.push("snippetContent");
      if (!saveBtn) missing.push("btnSave");
      if (!listEl) missing.push("snippetList");
      if (!toastEl) missing.push("toast");
      if (missing.length) throw new Error("missing: " + missing.join(", "));
    },
  },
  {
    name: "render function",
    fn: () => {
      if (typeof renderList !== "function") throw new Error("renderList missing");
    },
  },
];

function renderCheckRow(check) {
  const li = document.createElement("li");
  li.className = "debug-step";
  const status = document.createElement("span");
  status.className = "debug-step-status";
  const name = document.createElement("span");
  name.className = "debug-step-name";
  name.textContent = check.name;
  const detail = document.createElement("span");
  detail.className = "debug-step-detail";
  li.appendChild(status);
  li.appendChild(name);
  li.appendChild(detail);
  return { li, status, detail };
}

async function runChecks() {
  if (!dbgSteps) return;
  dbgSteps.innerHTML = "";
  if (dbgRunChecks) dbgRunChecks.disabled = true;

  const rows = checks.map((c) => {
    const row = renderCheckRow(c);
    row.li.classList.add("debug-step-run");
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
      row.li.classList.remove("debug-step-run");
      row.li.classList.add("debug-step-pass");
      row.status.textContent = "PASS";
      row.detail.textContent = out || "";
    } catch (err) {
      failed++;
      row.li.classList.remove("debug-step-run");
      row.li.classList.add("debug-step-fail");
      row.status.textContent = "FAIL";
      row.detail.textContent = err && err.message ? err.message : String(err);
    }
  }

  if (dbgRunChecks) dbgRunChecks.disabled = false;
  showToast(failed === 0 ? "All checks passed" : `${failed} check${failed === 1 ? "" : "s"} failed`, failed === 0 ? "success" : "error");
}

if (btnDebug && debugPanel) {
  btnDebug.addEventListener("click", () => {
    const opening = debugPanel.hidden;
    debugPanel.hidden = !opening;
    btnDebug.textContent = opening ? "Debug ▴" : "Debug ▾";
  });
}

if (dbgRunChecks) dbgRunChecks.addEventListener("click", runChecks);

loadSnippets();