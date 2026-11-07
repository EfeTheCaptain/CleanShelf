(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function setDraftState(s) {
    const el = CS.ui && CS.ui.draftIndicator;
    if (el) el.dataset.state = s;
  }

  function currentDraft() {
    const ui = CS.ui || {};
    // If drilled into a folder, that folder overrides everything
    const folderVal = CS.state.drilledFolder !== null
      ? CS.state.drilledFolder
      : (ui.folderInput ? ui.folderInput.value : "");

    return {
      title: ui.titleInput ? ui.titleInput.value : "",
      folder: folderVal,
      content: ui.contentInput ? ui.contentInput.value : "",
      updatedAt: Date.now(),
    };
  }

  function isDraftEmpty(d) {
    return !d.title && !d.folder && !d.content;
  }

  async function persistDraft() {
    CS.state.draftTimer = null;
    if (CS.state.editingSnippetId) return; // Only draft new snippets

    const draft = currentDraft();
    if (isDraftEmpty(draft)) {
      try {
        await CS.storage.removeDraft();
        setDraftState("idle");
      } catch (err) {
        CS.recordError("draft/clear", err);
        setDraftState("error");
      }
      return;
    }
    try {
      await CS.storage.setDraft(draft);
      setDraftState("saved");
    } catch (err) {
      CS.recordError("draft/save", err);
      setDraftState("error");
    }
  }

  function scheduleDraft() {
    if (CS.state.editingSnippetId) return;
    setDraftState("dirty");
    clearTimeout(CS.state.draftTimer);
    
    const delay = CS.state.settings.draftRate === "relaxed" 
      ? 2000 
      : CS.constants.DRAFT_DEBOUNCE_MS;
      
    CS.state.draftTimer = setTimeout(persistDraft, delay);
  }

  function flushDraft() {
    if (CS.state.draftTimer == null) return;
    clearTimeout(CS.state.draftTimer);
    CS.state.draftTimer = null;
    if (CS.state.editingSnippetId) return;

    const draft = currentDraft();
    if (isDraftEmpty(draft)) {
      chrome.storage.local.remove(CS.constants.DRAFT_KEY).catch(() => {});
      return;
    }
    chrome.storage.local.set({ [CS.constants.DRAFT_KEY]: draft }).catch(() => {});
  }

  async function loadDraft() {
    try {
      const draft = await CS.storage.getDraft();
      if (!draft || isDraftEmpty(draft) || CS.state.editingSnippetId) {
        setDraftState("idle");
        return;
      }
      if (CS.ui.titleInput) CS.ui.titleInput.value = typeof draft.title === "string" ? draft.title : "";
      if (CS.ui.folderInput && CS.state.drilledFolder === null) {
        CS.ui.folderInput.value = typeof draft.folder === "string" ? draft.folder : "";
      }
      if (CS.ui.contentInput) CS.ui.contentInput.value = typeof draft.content === "string" ? draft.content : "";
      setDraftState("saved");
    } catch (err) {
      CS.recordError("draft/load", err);
      setDraftState("error");
    }
  }

  async function clearDraft() {
    clearTimeout(CS.state.draftTimer);
    CS.state.draftTimer = null;
    try {
      await CS.storage.removeDraft();
      setDraftState("idle");
    } catch (err) {
      CS.recordError("draft/clear", err);
    }
  }

  CS.drafts = { setDraftState, currentDraft, isDraftEmpty, persistDraft, scheduleDraft, flushDraft, loadDraft, clearDraft };
})();
