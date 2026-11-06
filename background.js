const WINDOW_URL = "popup.html";
const WINDOW_WIDTH = 960;
const WINDOW_HEIGHT = 720;

async function focusExistingWindow() {
  if (typeof chrome.runtime.getContexts !== "function") return false;
  try {
    const contexts = await chrome.runtime.getContexts({ contextTypes: ["POPUP"] });
    for (const c of contexts) {
      if (c.windowId != null) {
        await chrome.windows.update(c.windowId, { focused: true });
        return true;
      }
    }
  } catch (_) {}
  return false;
}

async function openWindow() {
  if (await focusExistingWindow()) return;

  const url = chrome.runtime.getURL(WINDOW_URL);
  let left;
  let top;
  try {
    const current = await chrome.windows.getCurrent();
    const cx = (current.left || 0) + (current.width || WINDOW_WIDTH) / 2;
    const cy = (current.top || 0) + (current.height || WINDOW_HEIGHT) / 2;
    left = Math.round(cx - WINDOW_WIDTH / 2);
    top = Math.round(cy - WINDOW_HEIGHT / 2);
  } catch (_) {}

  await chrome.windows.create({
    url,
    type: "popup",
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    left,
    top,
    focused: true,
  });
}

chrome.action.onClicked.addListener(() => {
  openWindow();
});

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === "open-search-panel") openWindow();
});