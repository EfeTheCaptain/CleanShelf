const STORAGE_KEY = "cleanshelf_snippets";

const $ = (id) => document.getElementById(id);

const titleInput = $("snippetTitle");
const contentInput = $("snippetContent");
const saveBtn = $("btnSave");
const listEl = $("snippetList");
const btnDebug = $("btnDebug");
const debugPanel = $("debugPanel");
const dbgExtId = $("dbgExtId");
const dbgUrl = $("dbgUrl");
const dbgChrome = $("dbgChrome");
const dbgCount = $("dbgCount");
const dbgStorage = $("dbgStorage");
const dbgLastError = $("dbgLastError");
const dbgCounters = $("dbgCounters");
const dbgSelfTest = $("dbgSelfTest");
const dbgSelfTestResult = $("dbgSelfTestResult");

const diagnostics = {
  lastError: null,
  lastErrorAt: null,
  saveAttempts: 0,
  saveFailures: 0,
  loadAttempts: 0,
  loadFailures: 0,
};

function recordError(where, err) {
  const msg = err && err.message ? err.message : String(err);
  diagnostics.lastError = `${where}: ${msg}`;
  diagnostics.lastErrorAt = new Date().toISOString();
  console.error(`CleanShelf [${where}]`, err);
}

async function getSnippets() {
  const res = await chrome.storage.local.get(STORAGE_KEY);
  const list = res[STORAGE_KEY];
  return Array.isArray(list) ? list : [];
}

async function saveSnippets(list) {
  await chrome.storage.local.set({ [STORAGE_KEY]: list });
}

function renderEmpty(message, color) {
  if (!listEl) return;
  listEl.innerHTML = "";
  const p = document.createElement("p");
  p.style.cssText = `margin:0;color:${color};font-size:12px;`;
  p.textContent = message;
  listEl.appendChild(p);
}

function renderList(snippets) {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!snippets || snippets.length === 0) {
    renderEmpty("No snippets yet.", "#9ca3af");
    return;
  }
  const frag = document.createDocumentFragment();
  for (let i = snippets.length - 1; i >= 0; i--) {
    const s = snippets[i] || {};
    const div = document.createElement("div");
    div.className = "popup-item";

    const titleEl = document.createElement("div");
    titleEl.className = "popup-item-title";
    titleEl.textContent = s.title ? s.title : "Untitled";

    const contentEl = document.createElement("p");
    contentEl.className = "popup-item-content";
    contentEl.textContent = s.content ? s.content : "";

    div.appendChild(titleEl);
    div.appendChild(contentEl);
    frag.appendChild(div);
  }
  listEl.appendChild(frag);
}

async function loadSnippets() {
  diagnostics.loadAttempts++;
  try {
    const snippets = await getSnippets();
    renderList(snippets);
    return snippets;
  } catch (err) {
    diagnostics.loadFailures++;
    recordError("load", err);
    renderEmpty("Could not load snippets. Open Debug.", "#dc2626");
    return null;
  }
}

async function refreshDebug() {
  const setText = (el, text) => { if (el) el.textContent = text; };

  try {
    setText(dbgExtId, chrome.runtime && chrome.runtime.id ? chrome.runtime.id : "—");
  } catch (err) {
    setText(dbgExtId, "unavailable");
  }

  setText(dbgUrl, location.href || "—");

  const uaMatch = navigator.userAgent.match(/Chrome\/([\d.]+)/);
  setText(dbgChrome, uaMatch ? uaMatch[1] : (navigator.userAgent || "—"));

  try {
    const data = await chrome.storage.local.get(null);
    const snippets = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    setText(dbgCount, String(snippets.length));
    setText(dbgStorage, JSON.stringify(data, null, 2));
  } catch (err) {
    recordError("debug/storage", err);
    setText(dbgCount, "error");
    setText(dbgStorage, err && err.message ? err.message : String(err));
  }

  if (diagnostics.lastError) {
    setText(dbgLastError, `${diagnostics.lastError} @ ${diagnostics.lastErrorAt}`);
  } else {
    setText(dbgLastError, "none");
  }

  setText(
    dbgCounters,
    `load ${diagnostics.loadAttempts} (${diagnostics.loadFailures} fail) · save ${diagnostics.saveAttempts} (${diagnostics.saveFailures} fail)`
  );
}

async function runSelfTest() {
  const setResult = (text, color) => {
    if (dbgSelfTestResult) {
      dbgSelfTestResult.textContent = text;
      dbgSelfTestResult.style.color = color;
    }
  };
  const probeKey = "__cleanshelf_selftest__";
  try {
    const stamp = Date.now();
    await chrome.storage.local.set({ [probeKey]: stamp });
    const back = await chrome.storage.local.get(probeKey);
    if (back[probeKey] !== stamp) throw new Error("read-back mismatch");
    await chrome.storage.local.remove(probeKey);
    setResult("PASS", "#059669");
  } catch (err) {
    recordError("self-test", err);
    setResult("FAIL: " + (err && err.message ? err.message : String(err)), "#dc2626");
  }
}

async function handleSave() {
  diagnostics.saveAttempts++;
  const title = titleInput ? titleInput.value.trim() : "";
  const content = contentInput ? contentInput.value.trim() : "";
  if (!title && !content) {
    recordError("save", new Error("Both title and content are empty"));
    return;
  }

  if (saveBtn) saveBtn.disabled = true;
  try {
    const snippets = await getSnippets();
    snippets.push({
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: Date.now(),
    });
    await saveSnippets(snippets);
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    await loadSnippets();
  } catch (err) {
    diagnostics.saveFailures++;
    recordError("save", err);
  } finally {
    if (saveBtn) saveBtn.disabled = false;
    refreshDebug();
  }
}

if (saveBtn) saveBtn.addEventListener("click", handleSave);

if (btnDebug && debugPanel) {
  btnDebug.addEventListener("click", () => {
    const hidden = debugPanel.style.display === "none";
    debugPanel.style.display = hidden ? "block" : "none";
    if (hidden) refreshDebug();
  });
}

if (dbgSelfTest) dbgSelfTest.addEventListener("click", runSelfTest);

loadSnippets().then(() => refreshDebug());