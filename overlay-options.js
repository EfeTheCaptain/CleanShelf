(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  const radioGroups = {};

  function buildRadioGroup(title, name, options) {
    const { el } = CS.dom;
    const group = el("div", "cs-options-group");
    group.appendChild(el("label", "cs-label", title));
    const inputs = {};
    for (const opt of options) {
      const wrap = el("label", "cs-option-radio");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = opt.value;
      input.addEventListener("change", () => {
        if (input.checked) opt.onSelect(opt.value);
      });
      wrap.appendChild(input);
      wrap.appendChild(el("span", null, opt.label));
      group.appendChild(wrap);
      inputs[opt.value] = input;
    }
    return { group, inputs };
  }

  function buildOptionsView(onBack) {
    const { el } = CS.dom;
    const view = el("div", "cs-options-view");
    view.dataset.view = "options";
    view.hidden = true;

    const header = el("div", "cs-options-header");
    const backBtn = el("button", "cs-back-btn", "← Back");
    backBtn.type = "button";
    backBtn.addEventListener("click", onBack);
    header.appendChild(backBtn);
    header.appendChild(el("h2", "cs-options-title", "Options"));
    view.appendChild(header);

    const body = el("div", "cs-options-body");

    radioGroups.layout = buildRadioGroup("Layout", "cs-layout", [
      { value: "grid", label: "Folder grid (icons, 3 columns)", onSelect: setLayout },
      { value: "list", label: "List (grouped by folder)", onSelect: setLayout },
    ]);
    body.appendChild(radioGroups.layout.group);

    radioGroups.theme = buildRadioGroup("Color scheme", "cs-theme", [
      { value: "dark", label: "Dark", onSelect: setTheme },
      { value: "light", label: "Light", onSelect: setTheme },
      { value: "dracula", label: "Dracula", onSelect: setTheme },
      { value: "nord", label: "Nord", onSelect: setTheme },
      { value: "sepia", label: "Sepia", onSelect: setTheme },
    ]);
    body.appendChild(radioGroups.theme.group);

    radioGroups.contrast = buildRadioGroup("Contrast", "cs-contrast", [
      { value: "normal", label: "Normal", onSelect: setContrast },
      { value: "high", label: "High", onSelect: setContrast },
    ]);
    body.appendChild(radioGroups.contrast.group);

    radioGroups.fontSize = buildRadioGroup("Font size", "cs-fontsize", [
      { value: "sm", label: "Small", onSelect: setFontSize },
      { value: "md", label: "Medium", onSelect: setFontSize },
      { value: "lg", label: "Large", onSelect: setFontSize },
    ]);
    body.appendChild(radioGroups.fontSize.group);

    const dataGroup = el("div", "cs-options-group");
    dataGroup.appendChild(el("label", "cs-label", "Data"));
    const exportBtn = el("button", "cs-btn cs-option-action", "Export JSON");
    exportBtn.type = "button";
    exportBtn.addEventListener("click", () => CS.exportImport.exportSnippets());
    const importBtn = el("button", "cs-btn cs-option-action cs-option-secondary", "Import JSON");
    importBtn.type = "button";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.className = "cs-hidden";
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (file) CS.exportImport.importFromFile(file);
    });
    dataGroup.appendChild(exportBtn);
    dataGroup.appendChild(importBtn);
    dataGroup.appendChild(fileInput);
    dataGroup.appendChild(el("p", "cs-options-hint", "Export downloads all snippets. Import replaces all snippets."));
    body.appendChild(dataGroup);

    view.appendChild(body);
    return { view, backBtn, fileInput };
  }

  function syncOptionRadios() {
    const s = CS.state.settings;
    if (radioGroups.layout) {
      radioGroups.layout.inputs.grid.checked = s.layout === "grid";
      radioGroups.layout.inputs.list.checked = s.layout === "list";
    }
    if (radioGroups.theme) {
      radioGroups.theme.inputs.dark.checked = s.theme === "dark";
      radioGroups.theme.inputs.light.checked = s.theme === "light";
      if (radioGroups.theme.inputs.dracula) radioGroups.theme.inputs.dracula.checked = s.theme === "dracula";
      if (radioGroups.theme.inputs.nord) radioGroups.theme.inputs.nord.checked = s.theme === "nord";
      if (radioGroups.theme.inputs.sepia) radioGroups.theme.inputs.sepia.checked = s.theme === "sepia";
    }
    if (radioGroups.contrast) {
      radioGroups.contrast.inputs.normal.checked = s.contrast === "normal";
      radioGroups.contrast.inputs.high.checked = s.contrast === "high";
    }
    if (radioGroups.fontSize) {
      radioGroups.fontSize.inputs.sm.checked = s.fontSize === "sm";
      radioGroups.fontSize.inputs.md.checked = s.fontSize === "md";
      radioGroups.fontSize.inputs.lg.checked = s.fontSize === "lg";
    }
  }

  function applySettingsToDom() {
    const host = CS.ui && CS.ui.host;
    if (!host) return;
    host.dataset.theme = CS.state.settings.theme;
    host.dataset.contrast = CS.state.settings.contrast;
    host.dataset.size = CS.state.settings.fontSize;
  }

  function setLayout(layout) {
    if (layout !== "grid" && layout !== "list") return;
    if (CS.state.settings.layout === layout) return;
    CS.state.settings.layout = layout;
    CS.state.drilledFolder = null;
    CS.snippets.renderSnippets();
    CS.storage.persistSettings();
  }

  function setTheme(theme) {
    if (theme !== "dark" && theme !== "light") return;
    if (CS.state.settings.theme === theme) return;
    CS.state.settings.theme = theme;
    applySettingsToDom();
    CS.storage.persistSettings();
  }

  function setContrast(contrast) {
    if (contrast !== "normal" && contrast !== "high") return;
    if (CS.state.settings.contrast === contrast) return;
    CS.state.settings.contrast = contrast;
    applySettingsToDom();
    CS.storage.persistSettings();
  }

  function setFontSize(size) {
    if (size !== "sm" && size !== "md" && size !== "lg") return;
    if (CS.state.settings.fontSize === size) return;
    CS.state.settings.fontSize = size;
    applySettingsToDom();
    CS.storage.persistSettings();
  }

  CS.options = { buildOptionsView, syncOptionRadios, applySettingsToDom, setLayout, setTheme, setContrast, setFontSize };
})();