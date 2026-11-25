(() => {
  'use strict';
  /**
   * @typedef {Object} CleanShelfConstants
   * @property {string} HOST_ID
   * @property {string} STORAGE_KEY
   * @property {string} FOLDERS_KEY
   * @property {string} SETTINGS_KEY
   * @property {string} DRAFT_KEY
   * @property {string} UNFILED
   * @property {number} DRAFT_DEBOUNCE_MS
   * @property {CleanShelfSettings} DEFAULT_SETTINGS
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

  const HOST_ID = '__cleanshelf_host__';
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    try {
      if (typeof existing.__csClose === 'function') {
        existing.__csClose();
      } else {
        if (typeof existing.__csCleanup === 'function') existing.__csCleanup();
        existing.remove();
      }
    } catch (_) {
      try {
        if (typeof existing.__csCleanup === 'function') existing.__csCleanup();
        existing.remove();
      } catch (_) {
        /* ignore */
      }
    }
    globalThis.CleanShelf = { aborted: true };
    return;
  }
  /** @type {CleanShelfConstants} */
  const constants = {
    HOST_ID,
    STORAGE_KEY: 'cleanshelf_snippets',
    FOLDERS_KEY: 'cleanshelf_folders',
    SETTINGS_KEY: 'cleanshelf_settings',
    DRAFT_KEY: 'cleanshelf_draft',
    UNFILED: 'Unfiled',
    DRAFT_DEBOUNCE_MS: 400,
    DEFAULT_SETTINGS: {
      layout: 'grid',
      theme: 'dark',
      contrast: 'normal',
      fontSize: 'md',
      draftRate: 'fast',
      language: 'en',
    },
  };
  globalThis.CleanShelf = { constants };
})();
