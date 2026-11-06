(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  function showToast(message, variant, actionLabel, onAction) {
    const t = CS.ui && CS.ui.toast;
    if (!t) return;

    t.innerHTML = "";
    t.appendChild(document.createTextNode(message));

    let duration = 1600;

    if (actionLabel && onAction) {
      const btn = document.createElement("button");
      btn.className = "cs-toast-action";
      btn.textContent = actionLabel;
      btn.addEventListener("click", () => {
        onAction();
        t.hidden = true;
        clearTimeout(showToast._t);
      });
      t.appendChild(btn);
      duration = 3500; // Longer duration for Undo
    }

    t.dataset.variant = variant || "success";
    t.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { t.hidden = true; }, duration);
  }

  CS.toast = { showToast };
})();