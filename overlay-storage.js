(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  async function getSnippets() {
    const res = await chrome.storage.local.get(CS.constants.STORAGE_KEY);
    const list = res[CS.constants.STORAGE_KEY];
    return Array.isArray(list) ? list : [];
  }

  async function saveSnippets(list) {
    await chrome.storage.local.set({ [CS.constants.STORAGE_KEY]: list });
  }

  async function getSettings() {
    try {
      const res = await chrome.storage.local.get(CS.constants.SETTINGS_KEY);
    const s = res[CS.constants.SETTINGS_KEY] || {};
const validThemes = ["dark", "light", "dracula", "nord", "sepia"];
      return {
        layout: s.layout === "list" ? "list" : "grid",
        theme: validThemes.includes(s.theme) ? s.theme : "dark",
        contrast: s.contrast === "high" ? "high" : "normal",
        fontSize: s.fontSize === "sm" ? "sm" : s.fontSize === "lg" ? "lg" : "md",
        draftRate: s.draftRate === "relaxed" ? "relaxed" : "fast",
      };
    } catch (_) {
      return { ...CS.constants.DEFAULT_SETTINGS };
    }
  }

  async function persistSettings() {
    try {
      await chrome.storage.local.set({ [CS.constants.SETTINGS_KEY]: { ...CS.state.settings } });
    } catch (err) {
      CS.recordError("settings/save", err);
    }
  }

  async function getDraft() {
    const res = await chrome.storage.local.get(CS.constants.DRAFT_KEY);
    return res[CS.constants.DRAFT_KEY] || null;
  }

  async function setDraft(draft) {
    await chrome.storage.local.set({ [CS.constants.DRAFT_KEY]: draft });
  }

  async function removeDraft() {
    await chrome.storage.local.remove(CS.constants.DRAFT_KEY);
  }

  async function getFolders() {
    try {
      const res = await chrome.storage.local.get(CS.constants.FOLDERS_KEY);
      const list = res[CS.constants.FOLDERS_KEY];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  async function saveFolders(folders) {
    await chrome.storage.local.set({ [CS.constants.FOLDERS_KEY]: folders });
  }

  CS.storage = { getSnippets, saveSnippets, getSettings, persistSettings, getDraft, setDraft, removeDraft, getFolders, saveFolders };
})();