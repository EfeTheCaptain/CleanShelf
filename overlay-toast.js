(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function showToast(message, variant) {
    const t = CS.ui && CS.ui.toast;
    if (!t) return;
    t.textContent = message;
    t.dataset.variant = variant || "success";
    t.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { t.hidden = true; }, 1600);
  }

  CS.toast = { showToast };
})();