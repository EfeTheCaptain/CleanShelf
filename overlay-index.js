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

  // ---- MAIN VIEW (SIDE-BY-SIDE) ----
  const mainView = el("div", "cs-view");
  mainView.dataset.view = "main";
  CS.ui.mainView = mainView;

  const mainLayout = el("div", "cs-main-layout");
  
  // LEFT PANEL (Your snippets)
  const leftPanel = el("div", "cs-left-panel");
  const listSection = el("div", "cs-section cs-section-list");
  listSection.style.margin = "0";
  listSection.appendChild(el("label", "cs-label", "Your snippets"));
  const listEl = el("div", "cs-list");
  listSection.appendChild(listEl);
  leftPanel.appendChild(listSection);
  CS.ui.listEl = listEl;
  mainLayout.appendChild(leftPanel);

  // RIGHT PANEL (New/Edit snippet)
  const rightPanel = el("div", "cs-right-panel");
  
  const inputHeader = el("div", "cs-input-header");
  const formLabel = el("label", "cs-label", "New snippet");
  CS.ui.formLabel = formLabel;
  inputHeader.appendChild(formLabel);

  const draftIndicator = el("span", "cs-draft-indicator");
  draftIndicator.dataset.state = "idle";
  const { dotIcon, checkIcon, errIcon } = makeDraftIcons();
  draftIndicator.appendChild(dotIcon);
  draftIndicator.appendChild(checkIcon);
  draftIndicator.appendChild(errIcon);
  draftIndicator.appendChild(el("span", "cs-draft-text", "Draft"));
  inputHeader.appendChild(draftIndicator);
  CS.ui.draftIndicator = draftIndicator;
  rightPanel.appendChild(inputHeader);

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
  rightPanel.appendChild(fieldRow);
  rightPanel.appendChild(folderDatalist);

  const contentInput = el("textarea", "cs-textarea");
  contentInput.placeholder = "Paste your snippet here…";
  rightPanel.appendChild(contentInput);

  const btnRow = el("div", "cs-btn-row");
  const saveBtn = el("button", "cs-btn", "Save");
  saveBtn.type = "button";
  saveBtn.addEventListener("click", () => CS.snippets.handleSave());
  
  const cancelEditBtn = el("button", "cs-btn cs-option-secondary", "Cancel");
  cancelEditBtn.type = "button";
  cancelEditBtn.hidden = true;
  cancelEditBtn.addEventListener("click", () => CS.snippets.cancelEdit());

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(cancelEditBtn);
  rightPanel.appendChild(btnRow);

  CS.ui.titleInput = titleInput;
  CS.ui.folderInput = folderInput;
  CS.ui.folderDatalist = folderDatalist;
  CS.ui.contentInput = contentInput;
  CS.ui.saveBtn = saveBtn;
  CS.ui.cancelEditBtn = cancelEditBtn;
  mainLayout.appendChild(rightPanel);

  mainView.appendChild(mainLayout);
  card.appendChild(mainView);

  listEl.addEventListener("scroll", () => {
    if (CS.ui && CS.ui.contextMenu) CS.ui.contextMenu.hide();
  }, { passive: true });

  // wire drafts
  titleInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  folderInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  contentInput.addEventListener("input", () => CS.drafts.scheduleDraft());

  // ---- OPTIONS VIEW ----
  const optionsBuilt = CS.options.buildOptionsView(() => showMain());
  CS.ui.options = optionsBuilt;
  card.appendChild(optionsBuilt.view);

  // hint
  const hintText = el("p", "cs-hint");
  hintText.innerHTML = "Tip: Right-click snippets or folders for more options.<br>Data stays in your browser. No tracking. No network calls.<br><strong>Dev is not responsible for data loss. BACKUP YOUR DATA!</strong> Use the gear icon to Import/Export.";
  card.appendChild(hintText);

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

  // ---- CONTEXT MENU ----
  const contextMenu = el("div", "cs-context-menu");
  contextMenu.hidden = true;
  
  // Snippet menu items
  const editItem = el("button", "cs-context-item", "Edit");
  editItem.type = "button";
  const deleteSnippetItem = el("button", "cs-context-item cs-danger", "Delete");
  deleteSnippetItem.type = "button";
  
  // Folder menu items
  const renameFolderItem = el("button", "cs-context-item", "Rename");
  renameFolderItem.type = "button";
  const deleteFolderItem = el("button", "cs-context-item cs-danger", "Delete");
  deleteFolderItem.type = "button";

  contextMenu.appendChild(editItem);
  contextMenu.appendChild(deleteSnippetItem);
  contextMenu.appendChild(renameFolderItem);
  contextMenu.appendChild(deleteFolderItem);
  shadow.appendChild(contextMenu);

  const ctx = {
    targetType: null, // "snippet" | "folder"
    targetData: null, // snippet object or folder name string
    show(type, data, x, y) {
      this.targetType = type;
      this.targetData = data;
      
      if (type === "snippet") {
        editItem.hidden = false;
        deleteSnippetItem.hidden = false;
        renameFolderItem.hidden = true;
        deleteFolderItem.hidden = true;
      } else {
        editItem.hidden = true;
        deleteSnippetItem.hidden = true;
        renameFolderItem.hidden = false;
        deleteFolderItem.hidden = false;
      }

      contextMenu.style.left = x + "px";
      contextMenu.style.top = y + "px";
      contextMenu.hidden = false;
    },
    hide() {
      this.targetType = null;
      this.targetData = null;
      contextMenu.hidden = true;
    }
  };
  CS.ui.contextMenu = ctx;

  editItem.addEventListener("click", () => {
    if (ctx.targetType === "snippet") CS.snippets.startEdit(ctx.targetData);
    ctx.hide();
  });

  deleteSnippetItem.addEventListener("click", async () => {
    const s = ctx.targetData;
    ctx.hide();
    if (s) await CS.snippets.deleteSnippet(s.id);
  });

  renameFolderItem.addEventListener("click", () => {
    if (ctx.targetType === "folder") CS.snippets.startRenameFolder(ctx.targetData);
    ctx.hide();
  });

  deleteFolderItem.addEventListener("click", async () => {
    const name = ctx.targetData;
    ctx.hide();
    if (name) await CS.snippets.deleteFolder(name);
  });

  // ---- VIEW TRANSITIONS ----
  function showMain() {
    CS.state.view = "main";
    mainView.hidden = false;
    optionsBuilt.view.hidden = true;
    footer.hidden = false;
    if (CS.state.editingSnippetId) {
      contentInput.focus();
    } else {
      titleInput.focus();
    }
  }

  function showOptions() {
    if (CS.state.editingSnippetId) {
      CS.snippets.cancelEdit(); // Auto-cancel if navigating away
    }
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
    if (CS.snippets.hasEditChanges()) {
      const ok = confirm("You have unsaved changes to this snippet.\n\nClick OK to Update, or Cancel to Discard changes.");
      if (ok) {
        CS.snippets.handleSave(); // Saves and closes later, or just let it stay open?
        // Actually, if they click OK, we save. If they click Cancel, we discard and close.
        // But handleSave is async. We should wait.
        CS.snippets.handleSave().then(() => {
          CS.drafts.flushDraft();
          if (typeof host.__csCleanup === "function") host.__csCleanup();
          host.remove();
        });
        return;
      }
    }
    
    CS.drafts.flushDraft();
    if (typeof host.__csCleanup === "function") host.__csCleanup();
    host.remove();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      if (ctx.targetType) {
        ctx.hide();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
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
    if (!contextMenu.hidden && !contextMenu.contains(e.target)) ctx.hide();
  });

  backdrop.addEventListener("contextmenu", (e) => {
    if (!contextMenu.contains(e.target)) ctx.hide();
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