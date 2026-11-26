(() => {
  'use strict';
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  /**
   * @typedef {Object} CleanShelfSnippet
   * @property {string} id
   * @property {string} title
   * @property {string} folder
   * @property {string} content
   * @property {"subfolder"} [type]
   * @property {string} [subfolder]
   * @property {number} [sortOrder]
   * @property {number} createdAt
   * @property {number} [updatedAt]
   */

  /**
   * @typedef {Object} CleanShelfSettings
   * @property {"grid"|"list"} layout
   * @property {"dark"|"light"|"dracula"|"nord"|"sepia"|"dark-sepia"} theme
   * @property {"normal"|"high"} contrast
   * @property {"sm"|"md"|"lg"} fontSize
   * @property {"fast"|"relaxed"} draftRate
   * @property {"en"|"tr"} language
   */

  /**
   * @typedef {Object} CleanShelfDraft
   * @property {string} title
   * @property {string} folder
   * @property {string} content
   * @property {number} updatedAt
   */

  /**
   * @returns {Promise<CleanShelfSnippet[]>}
   */
  async function getSnippets() {
    const res = await chrome.storage.local.get(CS.constants.STORAGE_KEY);
    const list = res[CS.constants.STORAGE_KEY];
    return Array.isArray(list) ? list : [];
  }

  /**
   * @param {CleanShelfSnippet[]} list
   * @returns {Promise<void>}
   */
  async function saveSnippets(list) {
    await chrome.storage.local.set({ [CS.constants.STORAGE_KEY]: list });
  }

  /**
   * @returns {Promise<CleanShelfSettings>}
   */
  async function getSettings() {
    try {
      const res = await chrome.storage.local.get(CS.constants.SETTINGS_KEY);
      const s = res[CS.constants.SETTINGS_KEY] || {};
      const validThemes = ['dark', 'light', 'dracula', 'nord', 'sepia', 'dark-sepia'];
      return {
        layout: s.layout === 'list' ? 'list' : 'grid',
        theme: validThemes.includes(s.theme) ? s.theme : 'dark',
        contrast: s.contrast === 'high' ? 'high' : 'normal',
        fontSize: s.fontSize === 'sm' ? 'sm' : s.fontSize === 'lg' ? 'lg' : 'md',
        draftRate: s.draftRate === 'relaxed' ? 'relaxed' : 'fast',
        density:
          s.density === 'expanded' || s.density === 'compact' || s.density === 'minimum'
            ? s.density
            : CS.constants.DEFAULT_SETTINGS.density,
        sortMode:
          s.sortMode === 'newest' || s.sortMode === 'title' || s.sortMode === 'manual'
            ? s.sortMode
            : 'newest',
        language: s.language === 'tr' ? 'tr' : 'en',
      };
    } catch (_) {
      return { ...CS.constants.DEFAULT_SETTINGS };
    }
  }

  /** @returns {Promise<void>} */
  async function persistSettings() {
    try {
      await chrome.storage.local.set({
        [CS.constants.SETTINGS_KEY]: {
          ...CS.state.settings,
          density: CS.state.settings.density,
          sortMode: CS.state.settings.sortMode,
        },
      });
    } catch (err) {
      CS.recordError('settings/save', err);
    }
  }

  /**
   * @returns {Promise<CleanShelfDraft|null>}
   */
  async function getDraft() {
    const res = await chrome.storage.local.get(CS.constants.DRAFT_KEY);
    return res[CS.constants.DRAFT_KEY] || null;
  }

  /**
   * @param {CleanShelfDraft} draft
   * @returns {Promise<void>}
   */
  async function setDraft(draft) {
    await chrome.storage.local.set({ [CS.constants.DRAFT_KEY]: draft });
  }

  /** @returns {Promise<void>} */
  async function removeDraft() {
    await chrome.storage.local.remove(CS.constants.DRAFT_KEY);
  }

  /**
   * @returns {Promise<string[]>}
   */
  async function getFolders() {
    try {
      const res = await chrome.storage.local.get(CS.constants.FOLDERS_KEY);
      const list = res[CS.constants.FOLDERS_KEY];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * @param {string[]} folders
   * @returns {Promise<void>}
   */
  async function saveFolders(folders) {
    await chrome.storage.local.set({ [CS.constants.FOLDERS_KEY]: folders });
  }

  /** @type {CleanShelfStorageModule} */
  const storage = {
    getSnippets,
    saveSnippets,
    getSettings,
    persistSettings,
    getDraft,
    setDraft,
    removeDraft,
    getFolders,
    saveFolders,
  };
  CS.storage = storage;
})();
