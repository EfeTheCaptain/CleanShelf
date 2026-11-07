(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;


  function exportSnippets() {
    try {
      const data = {
        version: 3, // Bumped version for subfolders
        exportedAt: new Date().toISOString(),
        folders: Array.from(CS.state.folders || []),
        snippets: CS.state.snippets || [],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cleanshelf-${Date.now()}.json`;
      a.style.display = "none";
      const host = CS.ui && CS.ui.host;
      (host || document.body).appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      CS.toast.showToast(CS.i18n.t("toast_exported", { count: (CS.state.snippets || []).length }));
    } catch (err) {
      CS.recordError("export", err);
      CS.toast.showToast(CS.i18n.t("err_export"), "error");
    }
  }


  function importFromFile(file, mode) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || !Array.isArray(data.snippets)) {
          throw new Error("invalid file: missing snippets array");
        }
        
        // Normalize snippets, preserving new fields
        const normalized = data.snippets.map((s) => ({
          id: (s && typeof s.id === "string" && s.id) ? s.id : crypto.randomUUID(),
          title: (s && typeof s.title === "string") ? s.title : "",
          folder: (s && typeof s.folder === "string") ? s.folder : "",
          content: (s && typeof s.content === "string") ? s.content : "",
          type: (s && s.type === "subfolder") ? "subfolder" : undefined, // Preserve subfolder type
          subfolder: (s && typeof s.subfolder === "string") ? s.subfolder : undefined, // Preserve subfolder assignment
          sortOrder: (s && typeof s.sortOrder === "number") ? s.sortOrder : undefined,
          createdAt: (s && typeof s.createdAt === "number") ? s.createdAt : Date.now(),
          updatedAt: (s && typeof s.updatedAt === "number") ? s.updatedAt : undefined,
        }));
        
        const current = (CS.state.snippets || []).length;
        const msg = mode === "merge"
          ? CS.i18n.t("confirm_import_merge", { count: normalized.length, current })
          : CS.i18n.t("confirm_import_replace", { current, count: normalized.length });
        
        const ok = confirm(msg);
        if (!ok) return;


        let finalSnippets = normalized;
        
        // Handle folders
        const fileFolders = Array.isArray(data.folders) ? data.folders : [];
        // Extract folders from snippets just in case the export was from an older version
        for (const s of normalized) {
          if (s.folder && !fileFolders.includes(s.folder)) fileFolders.push(s.folder);
        }


        if (mode === "merge") {
          const existing = await CS.storage.getSnippets();
          const existingMap = new Map(existing.map(s => [s.id, s]));
          
          for (const s of normalized) {
            existingMap.set(s.id, s);
          }
          finalSnippets = Array.from(existingMap.values());


          // Merge folders
          const currentFolders = await CS.storage.getFolders();
          const mergedFolders = new Set([...currentFolders, ...fileFolders]);
          await CS.storage.saveFolders(Array.from(mergedFolders));
          CS.state.folders = mergedFolders;
        } else {
          // Replace folders
          await CS.storage.saveFolders(fileFolders);
          CS.state.folders = new Set(fileFolders);
        }
        
        await CS.storage.saveSnippets(finalSnippets);
        CS.state.drilledFolder = null;
        await CS.snippets.load();
        CS.toast.showToast(CS.i18n.t("toast_imported", { count: normalized.length }));
      } catch (err) {
        CS.recordError("import", err);
        CS.toast.showToast(CS.i18n.t("err_import"), "error");
      }
    };
    reader.onerror = (err) => {
      CS.recordError("import/read", err);
      CS.toast.showToast(CS.i18n.t("err_import_read"), "error");
    };
    reader.readAsText(file);
  }


  CS.exportImport = { exportSnippets, importFromFile };
})();
