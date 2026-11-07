const OVERLAY_FILES = [
  "overlay-constants.js",
  "overlay-dom.js",
  "overlay-styles.js",
  "overlay-i18n.js",
  "overlay-state.js",
  "overlay-storage.js",
  "overlay-toast.js",
  "overlay-clipboard.js",
  "overlay-drafts.js",
  "overlay-snippets.js",
  "overlay-options.js",
  "overlay-debug.js",
  "overlay-export-import.js",
  "overlay-index.js",
];

async function toggleOverlay(tab) {
  if (!tab || tab.id == null) {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = active;
  }
  if (!tab || tab.id == null) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: OVERLAY_FILES,
    });
  } catch (err) {
    console.warn("CleanShelf: cannot inject into this page", err);
  }
}

chrome.action.onClicked.addListener((tab) => {
  toggleOverlay(tab);
});

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== "open-search-panel") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggleOverlay(tab);
});