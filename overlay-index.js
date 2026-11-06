(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;
  const { HOST_ID } = CS.constants;
  const { el, makeGearIcon, makeDraftIcons } = CS.dom;

  // fresh state per session
  CS.state = CS.createState();
  CS.ui = {};

  // host + shadow + styles
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;display:block;";
  document.documentElement.appendChild(host);
  CS.ui.host = host;

  const shadow = host.attachShadow({ mode: "closed" });
  CS.styles.applyStyles(shadow);

  const backdrop = el("div", "cs-backdrop");
  const card = el("div", "cs-card");
  backdrop.appendChild(card);
  shadow.appendChild(backdrop);
  CS.ui.backdrop = backdrop;
  CS.ui.card = card;

  // toast (fixed overlay)
  const toastEl = el("div", "cs-toast");
  toastEl.hidden = true;
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  shadow.appendChild(toastEl);
  CS.ui.toast = toastEl;

  // header
  const header = el("header", "cs-header");
  const headerText = el("div", "cs-header-text");
  headerText.appendChild(el("h1", "cs-title", "CleanShelf"));
  headerText.appendChild(el("p", "cs-preview", "Save, folder, and copy your code snippets locally."));
  header.appendChild(headerText);
  card.appendChild(header);

  // ---- MAIN VIEW ----
  const mainView = el("div", "cs-view");
  mainView.dataset.view = "main";
  CS.ui.mainView = mainView;

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
  CS.ui.draftIndicator = draftIndicator;
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
  addSection.appendChild(folderDatalist);

  const contentInput = el("textarea", "cs-textarea");
  contentInput.placeholder = "Paste your snippet here…";
  addSection.appendChild(contentInput);

  const saveBtn = el("button", "cs-btn", "Save");
  saveBtn.type = "button";
  saveBtn.addEventListener("click", () => CS.snippets.handleSave());
  addSection.appendChild(saveBtn);

  CS.ui.titleInput = titleInput;
  CS.ui.folderInput = folderInput;
  CS.ui.folderDatalist = folderDatalist;
  CS.ui.contentInput = contentInput;
  CS.ui.saveBtn = saveBtn;
  mainView.appendChild(addSection);

  const listSection = el("div", "cs-section cs-section-list");
  listSection.appendChild(el("label", "cs-label", "Your snippets"));
  const listEl = el("div", "cs-list");
  listSection.appendChild(listEl);
  CS.ui.listEl = listEl;
  mainView.appendChild(listSection);
  card.appendChild(mainView);

  // wire drafts
  titleInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  folderInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  contentInput.addEventListener("input", () => CS.drafts.scheduleDraft());

  // ---- OPTIONS VIEW ----
  const optionsBuilt = CS.options.buildOptionsView(() => showMain());
  CS.ui.options = optionsBuilt;
  card.appendChild(optionsBuilt.view);

  // hint
  card.appendChild(el("p", "cs-hint", "Data stays in your browser. No tracking. No network calls."));

  // ---- FOOTER ----
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
  CS.ui.footer = footer;
  CS.ui.btnDebug = btnDebug;
  CS.ui.btnGear = btnGear;

  // ---- DEBUG PANEL ----
  const debugBuilt = CS.debug.buildDebugPanel();
  CS.ui.debug = debugBuilt;
  card.appendChild(debugBuilt.panel);

  btnDebug.addEventListener("click", () => {
    const opening = debugBuilt.panel.hidden;
    debugBuilt.panel.hidden = !opening;
    btnDebug.textContent = opening ? "Debug ▴" : "Debug ▾";
  });

  // ---- VIEW TRANSITIONS ----
  function showMain() {
    CS.state.view = "main";
    mainView.hidden = false;
    optionsBuilt.view.hidden = true;
    footer.hidden = false;
    titleInput.focus();
  }

  function showOptions() {
    CS.state.view = "options";
    mainView.hidden = true;
    optionsBuilt.view.hidden = false;
    footer.hidden = true;
    CS.options.syncOptionRadios();
    optionsBuilt.backBtn.focus();
  }

  btnGear.addEventListener("click", showOptions);

  // ---- LIFECYCLE ----
  function close() {
    CS.drafts.flushDraft();
    if (typeof host.__csCleanup === "function") host.__csCleanup();
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

  // ---- BOOTSTRAP ----
  (async () => {
    try {
      CS.state.settings = await CS.storage.getSettings();
    } catch (err) {
      CS.recordError("settings/load", err);
    }
    CS.options.applySettingsToDom();
    CS.options.syncOptionRadios();
    await CS.drafts.loadDraft();
    await CS.snippets.load();
    titleInput.focus();
  })();
})();