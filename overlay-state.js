(() => {
  'use strict';
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  /**
   * @typedef {Object} CleanShelfState
   * @property {"main"|"options"} view
   * @property {CleanShelfSettings} settings
   * @property {string|null} drilledFolder
   * @property {string|null} lastError
   * @property {string|null} lastErrorAt
   * @property {Set<string>} collapsedFolders
   * @property {Set<string>} collapsedSubfolders
   * @property {CleanShelfSnippet[]} snippets
   * @property {Set<string>} folders
   * @property {ReturnType<typeof setTimeout>|null} draftTimer
   * @property {string|null} editingSnippetId
   * @property {CleanShelfSnippet|null} originalEditData
   * @property {boolean} compactView
   * @property {"newest"|"title"|"manual"} sortMode
   * @property {string|null} draggingSnippetId
   * @property {string} searchQuery
   */

  /** @returns {CleanShelfState} */
  CS.createState = () => ({
    view: 'main',
    settings: { ...CS.constants.DEFAULT_SETTINGS },
    drilledFolder: null,
    lastError: null,
    lastErrorAt: null,
    collapsedFolders: new Set(),
    collapsedSubfolders: new Set(),
    snippets: [],
    folders: new Set(),
    draftTimer: null,
    editingSnippetId: null,
    originalEditData: null,
    compactView: false,
    sortMode: 'newest',
    draggingSnippetId: null,
    searchQuery: '',
  });

  /**
   * @param {string} where
   * @param {unknown} err
   */
  CS.recordError = (where, err) => {
    const msg = err && err.message ? err.message : String(err);
    CS.state.lastError = `${where}: ${msg}`;
    CS.state.lastErrorAt = new Date().toISOString();
    console.error(`CleanShelf [${where}]`, err);
    const target = CS.ui && CS.ui.debug && CS.ui.debug.lastErrorEl;
    if (target) target.textContent = `${CS.state.lastError} @ ${CS.state.lastErrorAt}`;
  };
})();
