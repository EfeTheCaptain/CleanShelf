(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;
  const { HOST_ID } = CS.constants;
  const { el, makeGearIcon, makeDraftIcons } = CS.dom;

  CS.state = CS.createState();
  CS.state.searchQuery = "";
  CS.ui = {};

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;display:block;";
  document.documentElement.appendChild(host);
  CS.ui.host = host;

  const shadow = host.attachShadow({ mode: "closed" });
  CS.styles.applyStyles(shadow);
  CS.ui.shadow = shadow;

  const backdrop = el("div", "cs-backdrop");
  const card = el("div", "cs-card");
  backdrop.appendChild(card);
  shadow.appendChild(backdrop);
  CS.ui.backdrop = backdrop;
  CS.ui.card = card;

  card.addEventListener("contextmenu", (e) => {
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  });

  const toastEl = el("div", "cs-toast");
  toastEl.hidden = true;
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  shadow.appendChild(toastEl);
  CS.ui.toast = toastEl;

  // --- HEADER ---
  const header = el("header", "cs-header");
  const headerText = el("div", "cs-header-text");
  
  const titleEl = el("h1", "cs-title", "CleanShelf");
  titleEl.setAttribute("data-i18n", "app_title");
  headerText.appendChild(titleEl);
  
  const subtitleEl = el("p", "cs-preview", "");
  subtitleEl.setAttribute("data-i18n", "app_subtitle");
  headerText.appendChild(subtitleEl);
  
  header.appendChild(headerText);
  card.appendChild(header);

  // --- MAIN VIEW ---
  const mainView = el("div", "cs-view");
  mainView.dataset.view = "main";
  CS.ui.mainView = mainView;

  const searchRow = el("div", "cs-search-row");
  const searchInput = el("input", "cs-input cs-search-input");
  searchInput.setAttribute("data-i18n-placeholder", "search_placeholder");
  searchInput.addEventListener("input", () => {
    CS.state.searchQuery = searchInput.value;
    CS.snippets.renderSnippets();
  });
  searchRow.appendChild(searchInput);
  // searchRow is moved into the right panel below so it shares the form column

  const mainLayout = el("div", "cs-main-layout");
  
  // --- LEFT PANEL ---
  const leftPanel = el("div", "cs-left-panel");
  const listSection = el("div", "cs-section cs-section-list");
  listSection.style.margin = "0";
  
  const leftHeader = el("div", "cs-input-header");
  const leftLabel = el("label", "cs-label", "Your snippets");
  leftLabel.setAttribute("data-i18n", "your_snippets");
  leftHeader.appendChild(leftLabel);
  
  const leftBtnGroup = el("div");
  leftBtnGroup.style.display = "flex";
  leftBtnGroup.style.gap = "6px";

  const leftActionBtn = el("button", "cs-debug-toggle", "+ Folder");
  leftActionBtn.type = "button";
  leftActionBtn.style.padding = "2px 8px";
  leftActionBtn.style.marginTop = "0";
  leftActionBtn.setAttribute("data-i18n", "btn_folder");
  CS.ui.leftActionBtn = leftActionBtn;

  const leftSubfolderBtn = el("button", "cs-debug-toggle", "+ Subfolder");
  leftSubfolderBtn.type = "button";
  leftSubfolderBtn.style.padding = "2px 8px";
  leftSubfolderBtn.style.marginTop = "0";
  leftSubfolderBtn.hidden = true;
  leftSubfolderBtn.setAttribute("data-i18n", "btn_subfolder");
  CS.ui.leftSubfolderBtn = leftSubfolderBtn;

  leftBtnGroup.appendChild(leftActionBtn);
  leftBtnGroup.appendChild(leftSubfolderBtn);
  leftHeader.appendChild(leftBtnGroup);
  
  listSection.appendChild(leftHeader);
  const listEl = el("div", "cs-list");
  listSection.appendChild(listEl);
  leftPanel.appendChild(listSection);
  CS.ui.listEl = listEl;
  mainLayout.appendChild(leftPanel);

  // --- RIGHT PANEL ---
  const rightPanel = el("div", "cs-right-panel");
  rightPanel.prepend(searchRow);
  const inputHeader = el("div", "cs-input-header");
  
  const formLabel = el("label", "cs-label", "New snippet");
  formLabel.setAttribute("data-i18n", "new_snippet");
  CS.ui.formLabel = formLabel;
  inputHeader.appendChild(formLabel);

  const draftIndicator = el("span", "cs-draft-indicator");
  draftIndicator.dataset.state = "idle";
  const { dotIcon, checkIcon, errIcon } = makeDraftIcons();
  draftIndicator.appendChild(dotIcon);
  draftIndicator.appendChild(checkIcon);
  draftIndicator.appendChild(errIcon);
  
  const draftText = el("span", "cs-draft-text", "Draft");
  draftText.setAttribute("data-i18n", "draft_label");
  draftIndicator.appendChild(draftText);
  inputHeader.appendChild(draftIndicator);
  CS.ui.draftIndicator = draftIndicator;
  rightPanel.appendChild(inputHeader);

  const fieldRow = el("div", "cs-field-row");
  const titleInput = el("input", "cs-input");
  titleInput.type = "text";
  titleInput.setAttribute("data-i18n-placeholder", "title_placeholder");
  
  const folderInput = el("input", "cs-input cs-input-folder");
  folderInput.type = "text";
  folderInput.setAttribute("data-i18n-placeholder", "folder_placeholder");
  folderInput.setAttribute("list", "cs-folder-list");
  
  fieldRow.appendChild(titleInput);
  fieldRow.appendChild(folderInput);
  
  const folderDatalist = document.createElement("datalist");
  folderDatalist.id = "cs-folder-list";
  rightPanel.appendChild(fieldRow);
  rightPanel.appendChild(folderDatalist);

  const contentInput = el("textarea", "cs-textarea");
  contentInput.setAttribute("data-i18n-placeholder", "content_placeholder");
  rightPanel.appendChild(contentInput);

  const btnRow = el("div", "cs-btn-row");
  const saveBtn = el("button", "cs-btn", "Save");
  saveBtn.type = "button";
  saveBtn.setAttribute("data-i18n", "btn_save");
  saveBtn.addEventListener("click", () => CS.snippets.handleSave());
  
  const cancelEditBtn = el("button", "cs-btn cs-option-secondary", "Cancel");
  cancelEditBtn.type = "button";
  cancelEditBtn.hidden = true;
  cancelEditBtn.setAttribute("data-i18n", "btn_cancel");
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

  titleInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  folderInput.addEventListener("input", () => CS.drafts.scheduleDraft());
  contentInput.addEventListener("input", () => CS.drafts.scheduleDraft());

  const optionsBuilt = CS.options.buildOptionsView(() => showMain());
  CS.ui.options = optionsBuilt;
  card.appendChild(optionsBuilt.view);

  let lastFocusedOverlayEl = null;
  shadow.addEventListener("focusin", (e) => {
    lastFocusedOverlayEl = e.target;
  });

  function isTextControl(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  function isVisibleControl(el) {
    return !!el && el.isConnected && !el.disabled && el.offsetParent !== null;
  }

  function focusPrimary() {
    const candidate = isTextControl(lastFocusedOverlayEl) && isVisibleControl(lastFocusedOverlayEl)
      ? lastFocusedOverlayEl
      : (CS.state.view === "options" && optionsBuilt.backBtn ? optionsBuilt.backBtn : searchInput);
    if (!candidate) return;
    try { candidate.focus({ preventScroll: true }); } catch (_) {
      try { candidate.focus(); } catch (_) {}
    }
  }
  CS.ui.focusPrimary = focusPrimary;
  queueMicrotask(focusPrimary);
  let focusAttempts = 0;
  (function ensureFocus() {
    if (shadow.activeElement === searchInput) return;
    searchInput.focus();
    if (focusAttempts++ < 10) setTimeout(ensureFocus, 30);
  })();

  // --- FOOTER ---
  const footer = el("div", "cs-footer");
  const footerLeft = el("div");
  footerLeft.style.display = "flex";
  footerLeft.style.gap = "8px";

  const btnDebug = el("button", "cs-debug-toggle", "Debug ▾");
  btnDebug.type = "button";
  btnDebug.setAttribute("data-i18n", "btn_debug");
  
  const btnTips = el("button", "cs-debug-toggle", "? Tips");
  btnTips.type = "button";
  btnTips.setAttribute("data-i18n", "btn_tips");

  footerLeft.appendChild(btnDebug);
  footerLeft.appendChild(btnTips);

  const btnGear = el("button", "cs-gear");
  btnGear.type = "button";
  btnGear.setAttribute("aria-label", "Options");
  btnGear.appendChild(makeGearIcon());
  
  footer.appendChild(footerLeft);
  footer.appendChild(btnGear);
  card.appendChild(footer);
  CS.ui.footer = footer;
  CS.ui.btnDebug = btnDebug;
  CS.ui.btnGear = btnGear;

  // --- TIPS PANEL ---
  const tipsPanel = el("div", "cs-tips-panel");
  tipsPanel.hidden = true;

  const tipsHeader = el("div", "cs-tips-header", "CleanShelf Tips");
  tipsHeader.setAttribute("data-i18n", "tip_title");
  tipsPanel.appendChild(tipsHeader);

  const tipsList = el("ul", "cs-tips-list");
  const tipsData = [
    { key: "tip_rc", type: "normal" },
    { key: "tip_backup", type: "warning" },
    { key: "tip_local", type: "normal" },
    { key: "tip_copy", type: "normal" },
    { key: "tip_drag", type: "normal" },
    { key: "tip_reorder", type: "normal" },
    { key: "tip_plus", type: "normal" },
    { key: "tip_subfolder", type: "normal" },
    { key: "tip_rename", type: "normal" },
    { key: "tip_drag_sub", type: "normal" },
  ];

  for (const tip of tipsData) {
    const li = el("li", tip.type === "warning" ? "cs-tip cs-tip-warning" : "cs-tip");
    li.setAttribute("data-i18n-html", tip.key);
    li.innerHTML = (CS.i18n && typeof CS.i18n.t === "function") ? CS.i18n.t(tip.key) : tip.key;
    tipsList.appendChild(li);
  }
  tipsPanel.appendChild(tipsList);
  shadow.appendChild(tipsPanel);

  btnTips.addEventListener("click", (e) => {
    e.stopPropagation();
    const opening = tipsPanel.hidden;
    tipsPanel.hidden = !opening;
    
    if (opening) {
      const rect = btnTips.getBoundingClientRect();
      tipsPanel.style.left = Math.max(16, rect.left - 100) + "px";
      tipsPanel.style.bottom = (window.innerHeight - rect.top + 8) + "px";
      tipsPanel.style.top = "auto";
    }
  });

  // --- CONTEXT MENU ---
  const contextMenu = el("div", "cs-context-menu");
  contextMenu.hidden = true;
  
  const editItem = el("button", "cs-context-item", "Edit");
  editItem.type = "button";
  editItem.setAttribute("data-i18n", "menu_edit");

  const deleteSnippetItem = el("button", "cs-context-item cs-danger", "Delete");
  deleteSnippetItem.type = "button";
  deleteSnippetItem.setAttribute("data-i18n", "menu_delete");
  
  const renameFolderItem = el("button", "cs-context-item", "Rename");
  renameFolderItem.type = "button";
  renameFolderItem.setAttribute("data-i18n", "menu_rename");

  const deleteFolderItem = el("button", "cs-context-item cs-danger", "Delete");
  deleteFolderItem.type = "button";
  deleteFolderItem.setAttribute("data-i18n", "menu_delete");

  const sortNewestItem = el("button", "cs-context-item", "Sort Newest");
  sortNewestItem.type = "button";
  sortNewestItem.setAttribute("data-i18n", "menu_sort_newest");

  const sortTitleItem = el("button", "cs-context-item", "Sort A-Z");
  sortTitleItem.type = "button";
  sortTitleItem.setAttribute("data-i18n", "menu_sort_az");

  const insertSubfolderItem = el("button", "cs-context-item", "Insert Subfolder");
  insertSubfolderItem.type = "button";
  insertSubfolderItem.setAttribute("data-i18n", "menu_insert_subfolder");

  contextMenu.appendChild(editItem);
  contextMenu.appendChild(deleteSnippetItem);
  contextMenu.appendChild(renameFolderItem);
  contextMenu.appendChild(deleteFolderItem);
  contextMenu.appendChild(sortNewestItem);
  contextMenu.appendChild(sortTitleItem);
  contextMenu.appendChild(insertSubfolderItem);
  shadow.appendChild(contextMenu);

  const ctx = {
    targetType: null,
    targetData: null,
    show(type, data, x, y) {
      this.targetType = type;
      this.targetData = data;
      
      if (type === "snippet") {
        editItem.hidden = false;
        deleteSnippetItem.hidden = false;
        renameFolderItem.hidden = true;
        deleteFolderItem.hidden = true;
        sortNewestItem.hidden = true;
        sortTitleItem.hidden = true;
        insertSubfolderItem.hidden = true;
      } else {
        editItem.hidden = true;
        deleteSnippetItem.hidden = true;
        renameFolderItem.hidden = false;
        deleteFolderItem.hidden = false;
        sortNewestItem.hidden = false;
        sortTitleItem.hidden = false;
        insertSubfolderItem.hidden = false;
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

  sortNewestItem.addEventListener("click", () => {
    CS.state.sortMode = "newest";
    CS.snippets.renderSnippets();
    CS.ui.contextMenu.hide();
  });

  sortTitleItem.addEventListener("click", () => {
    CS.state.sortMode = "title";
    CS.snippets.renderSnippets();
    CS.ui.contextMenu.hide();
  });

  insertSubfolderItem.addEventListener("click", () => {
    const folderName = ctx.targetData;
    CS.ui.contextMenu.hide();
    if (folderName) CS.snippets.insertSubfolder(folderName);
  });

  // --- DEBUG PANEL ---
  if (CS.debug && typeof CS.debug.buildDebugPanel === "function") {
    const debugBuilt = CS.debug.buildDebugPanel();
    CS.ui.debug = debugBuilt;
    card.appendChild(debugBuilt.panel);
    const _t = (k) => (CS.i18n && typeof CS.i18n.t === "function") ? CS.i18n.t(k) : k;
    btnDebug.addEventListener("click", () => {
      const opening = debugBuilt.panel.hidden;
      debugBuilt.panel.hidden = !opening;
      btnDebug.textContent = opening ? _t("btn_debug_up") : _t("btn_debug");
    });
  }

  // --- VIEW TRANSITIONS ---
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
    CS.state.view = "options";
    mainView.hidden = true;
    optionsBuilt.view.hidden = false;
    footer.hidden = true;
    CS.options.syncOptionRadios();
    optionsBuilt.backBtn.focus();
  }

  btnGear.addEventListener("click", showOptions);

  // --- LIFECYCLE ---
  function close() {
    if (host.__csClosing) return;
    host.__csClosing = true;
    if (CS.snippets.hasEditChanges()) {
      const ok = confirm((CS.i18n && typeof CS.i18n.t === "function") ? CS.i18n.t("confirm_unsaved") : "Unsaved changes. Discard?");
      if (ok) {
        CS.snippets.handleSave().then((saved) => {
          if (saved === false) {
            host.__csClosing = false;
            return;
          }
          CS.drafts.flushDraft();
          if (typeof host.__csCleanup === "function") host.__csCleanup();
          host.remove();
        }).catch(() => {
          host.__csClosing = false;
        });
        return;
      }
    }
    
    CS.drafts.flushDraft();
    if (typeof host.__csCleanup === "function") host.__csCleanup();
    host.remove();
  }
  host.__csClose = close;

  function onKey(e) {
    if (e.key === "Escape" || e.key === "Esc") {
      if (!tipsPanel.hidden) {
        tipsPanel.hidden = true;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (ctx.targetType) {
        ctx.hide();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }

    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    const insideOverlay = path.includes(host);
    if (!insideOverlay && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const typing = e.key.length === 1 || e.key === "Backspace" || e.key === "Delete" || e.key === "Enter";
      if (typing) {
        focusPrimary();
        e.preventDefault();
        e.stopPropagation();
        if (e.key.length === 1) {
          searchInput.value += e.key;
          CS.state.searchQuery = searchInput.value;
          CS.snippets.renderSnippets();
        }
      }
    }
  }

  const ac = new AbortController();
  document.addEventListener("keydown", onKey, { capture: true, signal: ac.signal });
  host.__csCleanup = () => {
    try { ac.abort(); } catch (_) {}
  };

  // Placed after all elements are created to prevent ReferenceErrors
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
    if (!contextMenu.hidden && !contextMenu.contains(e.target)) ctx.hide();
    if (!tipsPanel.hidden && !tipsPanel.contains(e.target) && !btnTips.contains(e.target)) {
      tipsPanel.hidden = true;
    }
  });

  backdrop.addEventListener("contextmenu", (e) => {
    if (!contextMenu.contains(e.target)) ctx.hide();
  });

  // --- BOOTSTRAP ---
  (async () => {
    try {
      CS.state.settings = await CS.storage.getSettings();
    } catch (err) {
      CS.recordError("settings/load", err);
    }
    CS.options.applySettingsToDom();
    CS.options.syncOptionRadios();
if (CS.i18n && typeof CS.i18n.applyTranslations === "function") {
  try { CS.i18n.applyTranslations(); } catch (err) { CS.recordError("i18n", err); }
}
    await CS.drafts.loadDraft();
    await CS.snippets.load();
    focusPrimary();
    requestAnimationFrame(() => {
      try { focusPrimary(); } catch (_) {}
    });
  })();
})();