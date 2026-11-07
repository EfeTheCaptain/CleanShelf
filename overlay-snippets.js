(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function getFilteredSnippets() {
    const q = (CS.state.searchQuery || "").trim().toLowerCase();
    const all = CS.state.snippets || [];
    if (!q) return all;
    return all.filter(s => 
      (s.title || "").toLowerCase().includes(q) || 
      (s.content || "").toLowerCase().includes(q) || 
      (s.folder || "").toLowerCase().includes(q)
    );
  }

  function groupByFolder(snippets) {
    const map = new Map();
    
    // 1. Pre-fill with explicit empty folders
    if (CS.state.folders) {
      for (const f of CS.state.folders) {
        if (f && f !== CS.constants.UNFILED) {
          map.set(f, []);
        }
      }
    }

    // 2. Add snippets to folders
    for (const s of snippets) {
      const key = (s && s.folder) ? s.folder : CS.constants.UNFILED;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    
    // 3. Sort folders, push Unfiled to end
    const names = [...map.keys()].filter((k) => k !== CS.constants.UNFILED).sort();
    if (map.has(CS.constants.UNFILED)) names.push(CS.constants.UNFILED);
    return names.map((name) => ({ name, items: map.get(name) }));
  }

  function renderFolderList(snippets) {
    const datalist = CS.ui && CS.ui.folderDatalist;
    if (!datalist) return;
    datalist.innerHTML = "";
    
    const folderSet = new Set(CS.state.folders || []);
    for (const s of snippets) if (s && s.folder) folderSet.add(s.folder);
    
    for (const f of [...folderSet].sort()) {
      const opt = document.createElement("option");
      opt.value = f;
      datalist.appendChild(opt);
    }
  }

  function updateFolderInputState() {
    const ui = CS.ui;
    if (!ui || !ui.folderInput) return;
    
    if (CS.state.drilledFolder !== null) {
      ui.folderInput.value = CS.state.drilledFolder;
      ui.folderInput.disabled = true;
      ui.folderInput.placeholder = "Folder (locked)";
    } else {
      ui.folderInput.disabled = false;
      ui.folderInput.placeholder = "Folder";
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

  function timeAgo(ts) {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  function buildSnippetCard(snippet) {
    const { el } = CS.dom;
    const cardEl = el("div", "cs-item");
    cardEl.setAttribute("role", "button");
    cardEl.setAttribute("tabindex", "0");
    cardEl.title = "Click to copy. Right-click for options.";
    cardEl.draggable = true;

    cardEl.appendChild(el("div", "cs-item-title", snippet.title || "Untitled"));
    cardEl.appendChild(el("p", "cs-item-content", snippet.content || ""));
    
    const timeStr = timeAgo(snippet.updatedAt || snippet.createdAt);
    if (timeStr) cardEl.appendChild(el("div", "cs-item-time", timeStr));

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

    cardEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", snippet.id);
      e.dataTransfer.effectAllowed = "move";
      cardEl.classList.add("cs-dragging");
    });

    cardEl.addEventListener("dragend", () => {
      cardEl.classList.remove("cs-dragging");
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

  function bindFolderDragDrop(element, folderName) {
    if (folderName === CS.constants.UNFILED) return;
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      element.classList.add("cs-drag-over");
    });
    element.addEventListener("dragleave", () => {
      element.classList.remove("cs-drag-over");
    });
    element.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove("cs-drag-over");
      const snippetId = e.dataTransfer.getData("text/plain");
      if (!snippetId) return;

      try {
        const snippets = await CS.storage.getSnippets();
        const idx = snippets.findIndex(s => s.id === snippetId);
        if (idx !== -1) {
          const targetFolder = folderName === CS.constants.UNFILED ? "" : folderName;
          if (snippets[idx].folder !== targetFolder) {
            snippets[idx].folder = targetFolder;
            snippets[idx].updatedAt = Date.now();
            await CS.storage.saveSnippets(snippets);
            await load();
            CS.toast.showToast(`Moved to ${folderName}`);
          }
        }
      } catch (err) {
        CS.recordError("move", err);
        CS.toast.showToast("Move failed", "error");
      }
    });
  }

  function createNewFolder() {
    const name = prompt("New folder name:");
    if (name && name.trim()) {
      const newName = name.trim();
      if (!CS.state.folders) CS.state.folders = new Set();
      CS.state.folders.add(newName);
      CS.storage.saveFolders([...CS.state.folders]).then(() => {
        load();
        CS.toast.showToast(`Created "${newName}"`);
      });
    }
  }

  function startRenameFolder(oldName) {
    const listEl = CS.ui.listEl;
    if (!listEl) return;
    
    const target = Array.from(listEl.querySelectorAll(".cs-folder-tile-name, .cs-folder-header span:not(.cs-folder-caret):not(.cs-folder-count), .cs-drill-title")).find(el => el.textContent === oldName);
    if (!target) return;


    const parent = target.parentElement;
    const input = document.createElement("input");
    input.className = "cs-input";
    input.style.padding = "2px 4px";
    input.style.fontSize = "inherit";
    input.style.height = "auto";
    input.style.width = "100%";
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
          return;
        }
      }
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
      }
      
      if (CS.state.folders) {
        CS.state.folders.delete(oldName);
        CS.state.folders.add(newName);
        await CS.storage.saveFolders([...CS.state.folders]);
      }


      // If we are currently inside the folder being renamed, keep us inside it
      if (CS.state.drilledFolder === oldName) {
        CS.state.drilledFolder = newName;
      }
      
      await load();
      CS.toast.showToast("Folder renamed");
    } catch (err) {
      CS.recordError("folder/rename", err);
      CS.toast.showToast("Rename failed", "error");
    }
  }

  async function deleteFolder(folderName) {
    try {
      const snippets = await CS.storage.getSnippets();
      const toDelete = snippets.filter((s) => s.folder === folderName);
      
      if (toDelete.length > 0) {
        const ok = confirm(`There are ${toDelete.length} snippets in "${folderName}". Are you sure you want to delete?`);
        if (!ok) return;
      }

      const filtered = snippets.filter((s) => s.folder !== folderName);
      await CS.storage.saveSnippets(filtered);
      
      if (CS.state.folders) {
        CS.state.folders.delete(folderName);
        await CS.storage.saveFolders([...CS.state.folders]);
      }
      
      await load();
      
      CS.toast.showToast("Folder deleted", "success", "Undo", async () => {
        if (CS.state.folders) {
          CS.state.folders.add(folderName);
          await CS.storage.saveFolders([...CS.state.folders]);
        }
        const current = await CS.storage.getSnippets();
        const restored = [...current, ...toDelete];
        await CS.storage.saveSnippets(restored);
        await load();
        CS.toast.showToast("Restored");
      });

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
    const snippets = getFilteredSnippets();
    
    if (snippets.length === 0 && (!CS.state.folders || CS.state.folders.size === 0)) {
      listEl.appendChild(el("p", "cs-empty", "No snippets found."));
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
      
      bindFolderContextMenu(headerBtn, group.name);
      bindFolderDragDrop(headerBtn, group.name);

      headerBtn.addEventListener("click", (e) => {
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
    const snippets = getFilteredSnippets();
    const groups = groupByFolder(snippets);

    if (CS.state.drilledFolder !== null) {
      const group = groups.find((g) => g.name === CS.state.drilledFolder);
      if (!group) {
        CS.state.drilledFolder = null;
        if (CS.state.editingSnippetId) cancelEdit();
        updateFolderInputState();
        return renderGridView();
      }
      const drillHeader = el("div", "cs-drill-header");
      
      const backBtn = el("button", "cs-back-btn", "← Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", () => {
        CS.state.drilledFolder = null;
        if (CS.state.editingSnippetId) cancelEdit();
        if (CS.ui.folderInput) CS.ui.folderInput.value = "";
        updateFolderInputState();
        renderSnippets();
      });
      drillHeader.appendChild(backBtn);
      
      const titleSpan = el("span", "cs-drill-title", group.name);
      drillHeader.appendChild(titleSpan);
      
      const countSpan = el("span", "cs-drill-count", String(group.items.length));
      drillHeader.appendChild(countSpan);
      
      // Toggle Compact View
      const compactBtn = el("button", "cs-back-btn", CS.state.compactView ? "Expand" : "Compact");
      compactBtn.type = "button";
      compactBtn.style.marginLeft = "8px";
      compactBtn.style.fontSize = "var(--cs-fs-xs)";
      compactBtn.addEventListener("click", () => {
        CS.state.compactView = !CS.state.compactView;
        renderSnippets();
      });
      drillHeader.appendChild(compactBtn);
      
      // Context menu toggle button
      const ctxBtn = el("button", "cs-back-btn cs-ctx-btn", "...");
      ctxBtn.type = "button";
      ctxBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = ctxBtn.getBoundingClientRect();
        if (CS.ui && CS.ui.contextMenu) {
          CS.ui.contextMenu.show("folder", group.name, rect.left, rect.bottom + 4);
        }
      });
      drillHeader.appendChild(ctxBtn);
      
      // NEW: Allow right-clicking anywhere on the header
      bindFolderContextMenu(drillHeader, group.name);


      listEl.appendChild(drillHeader);

      const items = el("div", "cs-drill-items");
      if (CS.state.compactView) items.classList.add("cs-compact");
      const ordered = group.items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      for (const s of ordered) items.appendChild(buildSnippetCard(s));
      
      if (ordered.length === 0) {
        items.appendChild(el("p", "cs-empty", "This folder is empty."));
      }
      
      listEl.appendChild(items);
      return;
    }

    if (groups.length === 0) {
      listEl.appendChild(el("p", "cs-empty", "No snippets found."));
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
      
      bindFolderContextMenu(tile, group.name);
      bindFolderDragDrop(tile, group.name);

      tile.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        CS.state.drilledFolder = group.name;
        if (CS.state.editingSnippetId) cancelEdit();
        renderSnippets();
      });
      grid.appendChild(tile);
    }
    listEl.appendChild(grid);
  }

  function updateLeftActionBtn() {
    const btn = CS.ui.leftActionBtn;
    if (!btn) return;
    
    if (CS.state.drilledFolder !== null) {
      btn.textContent = "+ Snippet";
      btn.onclick = (e) => {
        e.preventDefault();
        startInlineSnippetPrompt();
      };
    } else {
      btn.textContent = "+ Folder";
      btn.onclick = (e) => {
        e.preventDefault();
        createNewFolder();
      };
    }
  }


  function startInlineSnippetPrompt() {
    const btn = CS.ui.leftActionBtn;
    if (!btn || !btn.parentElement) return;
    
    const parent = btn.parentElement;
    const input = document.createElement("input");
    input.className = "cs-input";
    input.style.padding = "2px 8px";
    input.style.fontSize = "var(--cs-fs-xs)";
    input.style.width = "140px";
    input.style.height = "auto";
    input.placeholder = "Title...";
    
    parent.replaceChild(input, btn);
    input.focus();
    
    const finish = (save) => {
      input.removeEventListener("blur", onBlur);
      input.removeEventListener("keydown", onKey);
      
      // Put the button back
      if (input.parentElement) {
        input.parentElement.replaceChild(btn, input);
      }
      
      if (save) {
        const title = input.value.trim();
        if (title) {
          cancelEdit(); // Resets the right panel to "New snippet" mode
          if (CS.ui.titleInput) CS.ui.titleInput.value = title;
          if (CS.ui.contentInput) CS.ui.contentInput.focus();
          CS.drafts.scheduleDraft();
        }
      }
      updateLeftActionBtn();
    };
    
    const onBlur = () => finish(false);
    const onKey = (e) => {
      if (e.key === "Enter") { e.preventDefault(); finish(true); }
      if (e.key === "Escape") { e.preventDefault(); finish(false); }
    };
    
    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKey);
  }


  function renderSnippets() {
    updateLeftActionBtn();
    if (CS.state.settings.layout === "grid") renderGridView();
    else renderListView();
  }

  async function load() {
    try {
      const snippets = await CS.storage.getSnippets();
      const savedFolders = await CS.storage.getFolders();
      
      CS.state.folders = new Set(savedFolders);
      
      let foldersUpdated = false;
      for (const s of snippets) {
        if (s.folder && !CS.state.folders.has(s.folder)) {
          CS.state.folders.add(s.folder);
          foldersUpdated = true;
        }
      }
      if (foldersUpdated) {
        await CS.storage.saveFolders([...CS.state.folders]);
      }

      CS.state.snippets = snippets;
      renderFolderList(snippets);
      updateFolderInputState();
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
    
    updateFolderInputState();
    CS.drafts.clearDraft();

    if (ui.contentInput) ui.contentInput.focus();
  }

  function cancelEdit() {
    const ui = CS.ui;
    CS.state.editingSnippetId = null;
    CS.state.originalEditData = null;
    
    if (ui.titleInput) ui.titleInput.value = "";
    if (ui.folderInput) ui.folderInput.value = CS.state.drilledFolder || "";
    if (ui.contentInput) ui.contentInput.value = "";
    
    if (ui.formLabel) ui.formLabel.textContent = "New snippet";
    if (ui.saveBtn) ui.saveBtn.textContent = "Save";
    if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = true;
    
    updateFolderInputState();
    CS.drafts.clearDraft();
    if (ui.titleInput) ui.titleInput.focus();
  }

  function getUniqueTitle(baseTitle, folder, snippets) {
    const cleanBase = baseTitle.replace(/\s*\(\d+\)$/, "").trim() || "Untitled";
    let candidate = cleanBase;
    let counter = 2;


    while (snippets.some(s => (s.title || "").toLowerCase() === candidate.toLowerCase() && (s.folder || "") === folder)) {
      candidate = `${cleanBase} (${counter})`;
      counter++;
    }
    return candidate;
  }


  async function handleSave() {
    const ui = CS.ui;
    const title = ui.titleInput ? ui.titleInput.value.trim() : "";
    
    let folder = ui.folderInput ? ui.folderInput.value.trim() : "";
    if (CS.state.drilledFolder !== null) {
      folder = CS.state.drilledFolder;
    }


    const content = ui.contentInput ? ui.contentInput.value.trim() : "";
    if (!title && !content) {
      CS.toast.showToast("Add a title or content", "error");
      return;
    }
    
    const isEditing = !!CS.state.editingSnippetId;
    if (ui.saveBtn) ui.saveBtn.disabled = true;


    try {
      let snippets = await CS.storage.getSnippets();
      let finalTitle = title;


      // Duplicate check
      if (finalTitle) {
        const existingSnippet = snippets.find(s =>
          (s.title || "").toLowerCase() === finalTitle.toLowerCase() &&
          (s.folder || "") === (folder || "") &&
          s.id !== CS.state.editingSnippetId
        );


        if (existingSnippet) {
          const replace = confirm(`A snippet titled "${finalTitle}" already exists in this folder.\n\nClick OK to REPLACE it.\nClick Cancel to ADD AS NEW.`);
          
          if (replace) {
            // Overwrite target
            existingSnippet.content = content;
            existingSnippet.updatedAt = Date.now();
            
            // If we were editing a different snippet, remove the old one
            if (isEditing) {
              snippets = snippets.filter(s => s.id !== CS.state.editingSnippetId);
            }
            
            await CS.storage.saveSnippets(snippets);
            
            // Reset UI and exit early
            CS.state.editingSnippetId = null;
            CS.state.originalEditData = null;
            if (ui.titleInput) ui.titleInput.value = "";
            if (ui.folderInput) ui.folderInput.value = CS.state.drilledFolder || "";
            if (ui.contentInput) ui.contentInput.value = "";
            if (ui.formLabel) ui.formLabel.textContent = "New snippet";
            if (ui.saveBtn) ui.saveBtn.textContent = "Save";
            if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = true;
            updateFolderInputState();
            await CS.drafts.clearDraft();
            await load();
            CS.toast.showToast("Replaced existing snippet");
            return;
          } else {
            finalTitle = getUniqueTitle(finalTitle, folder || "", snippets);
          }
        }
      }


      // Proceed with normal save/update
      if (isEditing) {
        const idx = snippets.findIndex((s) => s.id === CS.state.editingSnippetId);
        if (idx !== -1) {
          snippets[idx] = {
            ...snippets[idx],
            title: finalTitle,
            folder: folder || "",
            content,
            updatedAt: Date.now(),
          };
        }
      } else {
        snippets.push({
          id: crypto.randomUUID(),
          title: finalTitle,
          folder: folder || "",
          content,
          createdAt: Date.now(),
        });
      }


      await CS.storage.saveSnippets(snippets);
      
      if (folder) {
        if (!CS.state.folders) CS.state.folders = new Set();
        if (!CS.state.folders.has(folder)) {
          CS.state.folders.add(folder);
          await CS.storage.saveFolders([...CS.state.folders]);
        }
      }
      
      CS.state.editingSnippetId = null;
      CS.state.originalEditData = null;
      
      if (ui.titleInput) ui.titleInput.value = "";
      if (ui.folderInput) ui.folderInput.value = CS.state.drilledFolder || "";
      if (ui.contentInput) ui.contentInput.value = "";
      
      if (ui.formLabel) ui.formLabel.textContent = "New snippet";
      if (ui.saveBtn) ui.saveBtn.textContent = "Save";
      if (ui.cancelEditBtn) ui.cancelEditBtn.hidden = true;


      updateFolderInputState();
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
    try {
      const snippets = await CS.storage.getSnippets();
      const snippetToDelete = snippets.find(s => s.id === id);
      if (!snippetToDelete) return;

      if (CS.state.editingSnippetId === id) {
        cancelEdit();
      }
      
      const filtered = snippets.filter((s) => s.id !== id);
      await CS.storage.saveSnippets(filtered);
      await load();
      
      CS.toast.showToast("Snippet deleted", "success", "Undo", async () => {
        const current = await CS.storage.getSnippets();
        current.push(snippetToDelete);
        await CS.storage.saveSnippets(current);
        await load();
        CS.toast.showToast("Restored");
      });
      
    } catch (err) {
      CS.recordError("delete", err);
      CS.toast.showToast("Delete failed", "error");
    }
  }

  async function createNewFolder() {
    const name = prompt("Enter folder name:");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    try {
      const folders = await CS.storage.getFolders();
      if (folders.includes(trimmed)) {
        CS.toast.showToast("Folder already exists", "error");
        return;
      }
      folders.push(trimmed);
      await CS.storage.saveFolders(folders);
      await CS.snippets.load();
      CS.toast.showToast(`Folder "${trimmed}" created`);
    } catch (err) {
      CS.recordError("folder/create", err);
      CS.toast.showToast("Create folder failed", "error");
    }
  }

  CS.snippets = {
    groupByFolder, renderFolderList, buildSnippetCard, renderListView, renderGridView,
    renderSnippets, load, handleSave, startEdit, cancelEdit, deleteSnippet, hasEditChanges,
    startRenameFolder, deleteFolder, updateFolderInputState, createNewFolder, updateLeftActionBtn, getUniqueTitle
  };
})();