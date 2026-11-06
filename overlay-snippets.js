(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function groupByFolder(snippets) {
    const map = new Map();
    for (const s of snippets) {
      const key = (s && s.folder) ? s.folder : CS.constants.UNFILED;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    const names = [...map.keys()].filter((k) => k !== CS.constants.UNFILED).sort();
    if (map.has(CS.constants.UNFILED)) names.push(CS.constants.UNFILED);
    return names.map((name) => ({ name, items: map.get(name) }));
  }

  function renderFolderList(snippets) {
    const datalist = CS.ui && CS.ui.folderDatalist;
    if (!datalist) return;
    const folders = new Set();
    for (const s of snippets) if (s && s.folder) folders.add(s.folder);
    datalist.innerHTML = "";
    for (const f of [...folders].sort()) {
      const opt = document.createElement("option");
      opt.value = f;
      datalist.appendChild(opt);
    }
  }

  function hasEditChanges() {
    if (!CS.state.editingSnippetId || !CS.state.originalEditData) return false;
    const ui = CS.ui;
    const currentTitle = ui.titleInput ? ui.titleInput.value.trim() : "";
    const currentFolder = ui.folderInput ? ui.folderInput.value.trim() : "";
    const currentContent = ui.contentInput ? ui.contentInput.value.trim() : "";
    const orig = CS.state.originalEditData;
    return currentTitle !== orig.title || currentFolder !== orig.folder || currentContent !== orig.content;
  }

  function buildSnippetCard(snippet) {
    const { el } = CS.dom;
    const cardEl = el("div", "cs-item");
    cardEl.setAttribute("role", "button");
    cardEl.setAttribute("tabindex", "0");
    cardEl.title = "Click to copy. Right-click for options.";
    cardEl.appendChild(el("div", "cs-item-title", snippet.title || "Untitled"));
    cardEl.appendChild(el("p", "cs-item-content", snippet.content || ""));
    cardEl.appendChild(el("span", "cs-item-copy", "Copy"));
    
    cardEl.addEventListener("click", () => CS.clipboard.copySnippet(snippet));
    cardEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        CS.clipboard.copySnippet(snippet);
      }
    });

    cardEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (CS.ui && CS.ui.contextMenu) {
        CS.ui.contextMenu.show("snippet", snippet, e.clientX, e.clientY);
      }
    });

    return cardEl;
  }

  function bindFolderContextMenu(element, folderName) {
    if (folderName === CS.constants.UNFILED) return;
    element.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (CS.ui && CS.ui.contextMenu) {
        CS.ui.contextMenu.show("folder", folderName, e.clientX, e.clientY);
      }
    });
  }

  function startRenameFolder(oldName) {
    // Find the DOM element containing this folder's name and swap it for an input
    const listEl = CS.ui.listEl;
    if (!listEl) return;
    
    const target = Array.from(listEl.querySelectorAll(".cs-folder-tile-name, .cs-folder-header span:not(.cs-folder-caret):not(.cs-folder-count)")).find(el => el.textContent === oldName);
    if (!target) return;

    const parent = target.parentElement;
    const input = document.createElement("input");
    input.className = "cs-input";
    input.style.padding = "2px 4px";
    input.style.fontSize = "inherit";
    input.style.height = "auto";
    input.value = oldName;
    
    parent.replaceChild(input, target);
    input.focus();
    input.select();

    const finish = async (save) => {
      input.removeEventListener("blur", onBlur);
      input.removeEventListener("keydown", onKey);
      if (save) {
        const newName = input.value.trim();
        if (newName && newName !== oldName) {
          await renameFolder(oldName, newName);
          return; // renderSnippets will be called by renameFolder
        }
      }
      // Revert if cancelled or unchanged
      parent.replaceChild(target, input);
    };

    const onBlur = () => finish(true);
    const onKey = (e) => {
      if (e.key === "Enter") { e.preventDefault(); finish(true); }
      if (e.key === "Escape") { e.preventDefault(); finish(false); }
    };

    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKey);
  }

  async function renameFolder(oldName, newName) {
    try {
      const snippets = await CS.storage.getSnippets();
      let changed = false;
      for (const s of snippets) {
        if (s.folder === oldName) {
          s.folder = newName;
          changed = true;
        }
      }
      if (changed) {
        await CS.storage.saveSnippets(snippets);
        await load();
        CS.toast.showToast("Folder renamed");
      }
    } catch (err) {
      CS.recordError("folder/rename", err);
      CS.toast.showToast("Rename failed", "error");
    }
  }

  async function deleteFolder(folderName) {
    try {
      const snippets = await CS.storage.getSnippets();
      const inFolder = snippets.filter((s) => s.folder === folderName);
      
      if (inFolder.length > 0) {
        const ok = confirm(`There are ${inFolder.length} snippets in "${folderName}". Are you sure you want to delete?`);
        if (!ok) return;
      }

      const filtered = snippets.filter((s) => s.folder !== folderName);
      await CS.storage.saveSnippets(filtered);
      await load();
      CS.toast.showToast("Folder deleted");
    } catch (err) {
      CS.recordError("folder/delete", err);
      CS.toast.showToast("Delete failed", "error");
    }
  }

  function renderListView() {
    const { el } = CS.dom;
    const listEl = CS.ui.listEl;
    if (!listEl) return;
    listEl.innerHTML = "";
    const snippets = CS.state.snippets || [];
    if (snippets.length === 0) {
      listEl.appendChild(el("p", "cs-empty", "No snippets yet."));
      return;
    }
    const frag = document.createDocumentFragment();
    for (const group of groupByFolder(snippets)) {
      const wrap = el("section", "cs-folder");
      if (CS.state.collapsedFolders.has(group.name)) wrap.classList.add("collapsed");

      const headerBtn = el("button", "cs-folder-header");
      headerBtn.type = "button";
      headerBtn.appendChild(el("span", "cs-folder-caret",
        CS.state.collapsedFolders.has(group.name) ? "▸" : "▾"));
      const nameSpan = el("span", null, group.name);
      headerBtn.appendChild(nameSpan);
      headerBtn.appendChild(el("span", "cs-folder-count", String(group.items.length)));
      
      bindFolderContextMenu(nameSpan, group.name);

      headerBtn.addEventListener("click", (e) => {
        // Don't toggle if we are editing the text
        if (e.target.tagName === "INPUT") return;
        if (CS.state.collapsedFolders.has(group.name)) CS.state.collapsedFolders.delete(group.name);
        else CS.state.collapsedFolders.add(group.name);
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
    const { el, makeFolderIcon } = CS.dom;
    const listEl = CS.ui.listEl;
    if (!listEl) return;
    listEl.innerHTML = "";
    const snippets = CS.state.snippets || [];
    const groups = groupByFolder(snippets);

    if (CS.state.drilledFolder !== null) {
      const group = groups.find((g) => g.name === CS.state.drilledFolder);
      if (!group) {
        CS.state.drilledFolder = null;
        return renderGridView();
      }
      const drillHeader = el("div", "cs-drill-header");
      const backBtn = el("button", "cs-back-btn", "← Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", () => {
        CS.state.drilledFolder = null;
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
      const nameDiv = el("div", "cs-folder-tile-name", group.name);
      tile.appendChild(nameDiv);
      tile.appendChild(el("div", "cs-folder-tile-count", String(group.items.length)));
      
      bindFolderContextMenu(nameDiv, group.name);

      tile.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        CS.state.drilledFolder = group.name;
        renderSnippets();
      });
      grid.appendChild(tile);
    }
    listEl.appendChild(grid);
  }

  function renderSnippets() {
    if (CS.state.settings.layout === "grid") renderGridView();
    else renderListView();
  }

  async function load() {
    try {
      const snippets = await CS.storage.getSnippets();
      CS.state.snippets = snippets;
      renderFolderList(snippets);
      renderSnippets();
      return snippets;
    } catch (err) {
      CS.recordError("load", err);
      const listEl = CS.ui.listEl;
      if (listEl) {
        listEl.innerHTML = "";
        const p = CS.dom.el("p", "cs-empty", "Could not load snippets. Open Debug.");
        p.style.color = "var(--cs-error)";
        listEl.appendChild(p);
      }
      return null;
    }
  }

  function startEdit(snippet) {
    const ui = CS.ui;
    if (ui.titleInput) ui.titleInput.value = snippet.title || "";
    if (ui.folderInput) ui.folderInput.value = snippet.folder || "";
    if (ui.contentInput) ui.contentInput.value = snippet.content || "";
    
    CS.state.editingSnippetId = snippet.id;
    CS.state.originalEditData = {
      title: snippet.title || "",
      folder: snippet.folder || "",
      content: snippet.content || ""
    };

    if (ui.formLabel) ui.formLabel.textContent = "Edit snippet";
    if (ui.saveBtn) ui.saveBtn.textContent = "Update";
    if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = false;
    
    // Clear new snippet draft state
    CS.drafts.clearDraft();

    if (ui.contentInput) ui.contentInput.focus();
  }

  function cancelEdit() {
    const ui = CS.ui;
    CS.state.editingSnippetId = null;
    CS.state.originalEditData = null;
    
    if (ui.titleInput) ui.titleInput.value = "";
    if (ui.folderInput) ui.folderInput.value = "";
    if (ui.contentInput) ui.contentInput.value = "";
    
    if (ui.formLabel) ui.formLabel.textContent = "New snippet";
    if (ui.saveBtn) ui.saveBtn.textContent = "Save";
    if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = true;
    
    CS.drafts.clearDraft();
    if (ui.titleInput) ui.titleInput.focus();
  }

  async function handleSave() {
    const ui = CS.ui;
    const title = ui.titleInput ? ui.titleInput.value.trim() : "";
    const folder = ui.folderInput ? ui.folderInput.value.trim() : "";
    const content = ui.contentInput ? ui.contentInput.value.trim() : "";
    if (!title && !content) {
      CS.recordError("save", new Error("Both title and content are empty"));
      CS.toast.showToast("Add a title or content", "error");
      return;
    }
    
    const isEditing = !!CS.state.editingSnippetId;
    if (ui.saveBtn) ui.saveBtn.disabled = true;

    try {
      const snippets = await CS.storage.getSnippets();
      
      if (isEditing) {
        const idx = snippets.findIndex((s) => s.id === CS.state.editingSnippetId);
        if (idx !== -1) {
          snippets[idx] = {
            ...snippets[idx],
            title,
            folder: folder || "",
            content,
            updatedAt: Date.now(),
          };
        }
      } else {
        snippets.push({
          id: crypto.randomUUID(),
          title,
          folder: folder || "",
          content,
          createdAt: Date.now(),
        });
      }

      await CS.storage.saveSnippets(snippets);
      
      CS.state.editingSnippetId = null;
      CS.state.originalEditData = null;
      
      if (ui.titleInput) ui.titleInput.value = "";
      if (ui.folderInput) ui.folderInput.value = "";
      if (ui.contentInput) ui.contentInput.value = "";
      
      if (ui.formLabel) ui.formLabel.textContent = "New snippet";
      if (ui.saveBtn) ui.saveBtn.textContent = "Save";
      if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = true;

      await CS.drafts.clearDraft();
      await load();
      CS.toast.showToast(isEditing ? "Updated" : "Saved");
    } catch (err) {
      CS.recordError("save", err);
      CS.toast.showToast("Save failed", "error");
    } finally {
      if (ui.saveBtn) ui.saveBtn.disabled = false;
    }
  }

  async function deleteSnippet(id) {
    if (!confirm("Delete this snippet?")) return;
    try {
      const snippets = await CS.storage.getSnippets();
      const filtered = snippets.filter((s) => s.id !== id);
      await CS.storage.saveSnippets(filtered);
      await load();
      CS.toast.showToast("Snippet deleted");
    } catch (err) {
      CS.recordError("delete", err);
      CS.toast.showToast("Delete failed", "error");
    }
  }

  CS.snippets = {
    groupByFolder, renderFolderList, buildSnippetCard, renderListView, renderGridView,
    renderSnippets, load, handleSave, startEdit, cancelEdit, deleteSnippet, hasEditChanges,
    startRenameFolder, deleteFolder
  };
})();