(() => {
  "use strict";
  const HOST_ID = "__cleanshelf_host__";
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    try {
      if (typeof existing.__csClose === "function") {
        existing.__csClose();
      } else {
        if (typeof existing.__csCleanup === "function") existing.__csCleanup();
        existing.remove();
      }
    } catch (_) {
      try {
        if (typeof existing.__csCleanup === "function") existing.__csCleanup();
        existing.remove();
      } catch (_) {}
    }
    globalThis.CleanShelf = { aborted: true };
    return;
  }
  globalThis.CleanShelf = {
    constants: {
      HOST_ID,
      STORAGE_KEY: "cleanshelf_snippets",
      FOLDERS_KEY: "cleanshelf_folders",
      SETTINGS_KEY: "cleanshelf_settings",
      DRAFT_KEY: "cleanshelf_draft",
      UNFILED: "Unfiled",
      DRAFT_DEBOUNCE_MS: 400,
      DEFAULT_SETTINGS: { layout: "grid", theme: "dark", contrast: "normal", fontSize: "md", draftRate: "fast", language: "en" },
    },
  };
})();