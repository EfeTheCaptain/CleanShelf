(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function exportSnippets() {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
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
      CS.toast.showToast(`Exported ${(CS.state.snippets || []).length} snippets`);
    } catch (err) {
      CS.recordError("export", err);
      CS.toast.showToast("Export failed", "error");
    }
  }

  function importFromFile(file) {
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
        const current = (CS.state.snippets || []).length;
        const ok = confirm(`Replace ${current} snippet${current === 1 ? "" : "s"} with ${normalized.length} from file?`);
        if (!ok) return;
        await CS.storage.saveSnippets(normalized);
        CS.state.drilledFolder = null;
        await CS.snippets.load();
        CS.toast.showToast(`Imported ${normalized.length} snippets`);
      } catch (err) {
        CS.recordError("import", err);
        CS.toast.showToast("Import failed", "error");
      }
    };
    reader.onerror = (err) => {
      CS.recordError("import/read", err);
      CS.toast.showToast("Import read failed", "error");
    };
    reader.readAsText(file);
  }

  CS.exportImport = { exportSnippets, importFromFile };
})();