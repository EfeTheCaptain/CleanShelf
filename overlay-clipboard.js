(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (_) {
      const host = CS.ui && CS.ui.host;
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
      (host || document.body).appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
      if (!ok) throw new Error("clipboard write failed");
    }
  }

  async function copySnippet(snippet) {
    const text = snippet && snippet.content ? snippet.content : "";
    if (!text) { CS.toast.showToast("Nothing to copy", "error"); return; }
    try {
      await copyText(text);
      CS.toast.showToast("Copied to clipboard");
    } catch (err) {
      CS.recordError("clipboard", err);
      CS.toast.showToast("Copy failed", "error");
    }
  }

  CS.clipboard = { copyText, copySnippet };
})();