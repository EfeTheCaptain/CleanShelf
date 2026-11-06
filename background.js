chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd === "open-search-panel") {
    try { await chrome.action.openPopup(); } catch (_) {}
  }
});
