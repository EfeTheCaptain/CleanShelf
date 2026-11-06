(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  CS.createState = () => ({
    view: "main",
    settings: { ...CS.constants.DEFAULT_SETTINGS },
    drilledFolder: null,
    lastError: null,
    lastErrorAt: null,
    collapsedFolders: new Set(),
    snippets: [],
    draftTimer: null,
  });

  CS.recordError = (where, err) => {
    const msg = err && err.message ? err.message : String(err);
    CS.state.lastError = `${where}: ${msg}`;
    CS.state.lastErrorAt = new Date().toISOString();
    console.error(`CleanShelf [${where}]`, err);
    const target = CS.ui && CS.ui.debug && CS.ui.debug.lastErrorEl;
    if (target) target.textContent = `${CS.state.lastError} @ ${CS.state.lastErrorAt}`;
  };
})();