(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  const checks = [
    {
      name: "storage.local API",
      fn: () => {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
          throw new Error("chrome.storage.local unavailable");
        }
      },
    },
    {
      name: "storage round-trip",
      fn: async () => {
        const k = "__cleanshelf_check__";
        const v = Date.now();
        await chrome.storage.local.set({ [k]: v });
        const out = await chrome.storage.local.get(k);
        await chrome.storage.local.remove(k);
        if (out[k] !== v) throw new Error("read-back mismatch");
      },
    },
    {
      name: "snippets readable",
      fn: async () => {
        const list = await CS.storage.getSnippets();
        if (!Array.isArray(list)) throw new Error("not an array");
        return `${list.length} items`;
      },
    },
    {
      name: "settings readable",
      fn: async () => {
        const s = await CS.storage.getSettings();
        if (!["grid", "list"].includes(s.layout)) throw new Error("layout: " + s.layout);
        if (!["dark", "light", "sepia", "dracula", "nord"].includes(s.theme)) throw new Error("theme: " + s.theme);
        if (!["normal", "high"].includes(s.contrast)) throw new Error("contrast: " + s.contrast);
        if (!["sm", "md", "lg"].includes(s.fontSize)) throw new Error("fontSize: " + s.fontSize);
        return `${s.layout}/${s.theme}/${s.contrast}/${s.fontSize}`;
      },
    },
    {
      name: "draft round-trip",
      fn: async () => {
        const k = "__cleanshelf_draft_check__";
        const v = { title: "t", folder: "f", content: "c", updatedAt: 1 };
        await chrome.storage.local.set({ [k]: v });
        const out = await chrome.storage.local.get(k);
        await chrome.storage.local.remove(k);
        if (!out[k] || out[k].title !== "t") throw new Error("draft round-trip failed");
      },
    },
    {
      name: "clipboard API",
      fn: () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          throw new Error("navigator.clipboard.writeText missing");
        }
      },
    },
    {
      name: "crypto.randomUUID",
      fn: () => {
        if (typeof crypto.randomUUID !== "function") {
          throw new Error("crypto.randomUUID missing");
        }
      },
    },
    {
      name: "DOM refs bound",
      fn: () => {
        const ui = CS.ui || {};
        const missing = [];
        if (!ui.titleInput) missing.push("title");
        if (!ui.folderInput) missing.push("folder");
        if (!ui.contentInput) missing.push("content");
        if (!ui.saveBtn) missing.push("save");
        if (!ui.listEl) missing.push("list");
        if (!ui.mainView) missing.push("mainView");
        if (!ui.options || !ui.options.view) missing.push("optionsView");
        if (!ui.options || !ui.options.fileInput) missing.push("fileInput");
        if (!ui.btnGear) missing.push("gear");
        if (!ui.draftIndicator) missing.push("draftIndicator");
        if (!ui.toast) missing.push("toast");
        if (missing.length) throw new Error("missing: " + missing.join(", "));
      },
    },
    {
      name: "module functions",
      fn: () => {
        if (!CS.snippets || typeof CS.snippets.renderSnippets !== "function") throw new Error("snippets.renderSnippets");
        if (!CS.options || typeof CS.options.applySettingsToDom !== "function") throw new Error("options.applySettingsToDom");
        if (!CS.exportImport || typeof CS.exportImport.exportSnippets !== "function") throw new Error("exportImport.exportSnippets");
        if (!CS.drafts || typeof CS.drafts.persistDraft !== "function") throw new Error("drafts.persistDraft");
      },
    },
  ];

  function renderCheckRow(check) {
    const { el } = CS.dom;
    const li = el("li", "cs-debug-step");
    const status = el("span", "cs-debug-step-status");
    const name = el("span", "cs-debug-step-name", check.name);
    const detail = el("span", "cs-debug-step-detail");
    li.appendChild(status);
    li.appendChild(name);
    li.appendChild(detail);
    return { li, status, detail };
  }

  function buildDebugPanel() {
    const { el } = CS.dom;
    const panel = el("div", "cs-debug-panel");
    panel.hidden = true;

    const lastErrorRow = el("div", "cs-debug-row");
    lastErrorRow.appendChild(el("span", "cs-debug-key", "Last Error:"));
    const lastErrorEl = el("span", "cs-debug-val", "none");
    lastErrorRow.appendChild(lastErrorEl);
    panel.appendChild(lastErrorRow);

    const checkRow = el("div", "cs-debug-row");
    checkRow.appendChild(el("span", "cs-debug-key", "Checkup:"));
    const runBtn = el("button", "cs-debug-btn", "Run steps");
    runBtn.type = "button";
    runBtn.addEventListener("click", () => runChecks());
    checkRow.appendChild(runBtn);
    panel.appendChild(checkRow);

    const stepsEl = el("ul", "cs-debug-steps");
    panel.appendChild(stepsEl);

    return { panel, lastErrorEl, runBtn, stepsEl };
  }

  async function runChecks() {
    const dbg = CS.ui && CS.ui.debug;
    if (!dbg) return;
    const { stepsEl, runBtn } = dbg;
    stepsEl.innerHTML = "";
    runBtn.disabled = true;

    const rows = checks.map((c) => {
      const row = renderCheckRow(c);
      row.li.classList.add("cs-debug-step-run");
      row.status.textContent = "RUN";
      stepsEl.appendChild(row.li);
      return row;
    });

    let failed = 0;
    for (let i = 0; i < checks.length; i++) {
      const c = checks[i];
      const row = rows[i];
      try {
        const out = await c.fn();
        row.li.classList.remove("cs-debug-step-run");
        row.li.classList.add("cs-debug-step-pass");
        row.status.textContent = "PASS";
        row.detail.textContent = out || "";
      } catch (err) {
        failed++;
        row.li.classList.remove("cs-debug-step-run");
        row.li.classList.add("cs-debug-step-fail");
        row.status.textContent = "FAIL";
        row.detail.textContent = err && err.message ? err.message : String(err);
      }
    }

    runBtn.disabled = false;
    CS.toast.showToast(
      failed === 0 ? "All checks passed" : `${failed} check${failed === 1 ? "" : "s"} failed`,
      failed === 0 ? "success" : "error"
    );
  }

  CS.debug = { buildDebugPanel, runChecks, checks };
})();