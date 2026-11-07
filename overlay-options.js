(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  const radioGroups = {};
  const t = (key) => CS.i18n.t(key);

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
    const backBtn = el("button", "cs-back-btn", t("btn_back"));
    backBtn.type = "button";
    backBtn.addEventListener("click", onBack);
    header.appendChild(backBtn);
    const titleEl = el("h2", "cs-options-title", t("opt_title"));
    titleEl.setAttribute("data-i18n", "opt_title");
    header.appendChild(titleEl);
    view.appendChild(header);

    const body = el("div", "cs-options-body");
    const colLeft = el("div", "cs-options-col");
    const colRight = el("div", "cs-options-col");

    radioGroups.layout = buildRadioGroup(t("opt_layout"), "cs-layout", [
      { value: "grid", label: t("opt_grid"), onSelect: setLayout },
      { value: "list", label: t("opt_list"), onSelect: setLayout },
    ]);
    colLeft.appendChild(radioGroups.layout.group);

    radioGroups.theme = buildRadioGroup(t("opt_theme"), "cs-theme", [
      { value: "dark", label: t("opt_dark"), onSelect: setTheme },
      { value: "light", label: t("opt_light"), onSelect: setTheme },
      { value: "dracula", label: t("opt_dracula"), onSelect: setTheme },
      { value: "nord", label: t("opt_nord"), onSelect: setTheme },
      { value: "sepia", label: t("opt_sepia"), onSelect: setTheme },
      { value: "dark-sepia", label: t("opt_dark_sepia"), onSelect: setTheme },
    ]);
    colLeft.appendChild(radioGroups.theme.group);

    radioGroups.contrast = buildRadioGroup(t("opt_contrast"), "cs-contrast", [
      { value: "normal", label: t("opt_normal"), onSelect: setContrast },
      { value: "high", label: t("opt_high"), onSelect: setContrast },
    ]);
    colLeft.appendChild(radioGroups.contrast.group);

    radioGroups.fontSize = buildRadioGroup(t("opt_font_size"), "cs-fontsize", [
      { value: "sm", label: t("opt_sm"), onSelect: setFontSize },
      { value: "md", label: t("opt_md"), onSelect: setFontSize },
      { value: "lg", label: t("opt_lg"), onSelect: setFontSize },
    ]);
    colLeft.appendChild(radioGroups.fontSize.group);

    radioGroups.draftRate = buildRadioGroup(t("opt_draft_rate"), "cs-draftrate", [
      { value: "fast", label: t("opt_fast"), onSelect: setDraftRate },
      { value: "relaxed", label: t("opt_relaxed"), onSelect: setDraftRate },
    ]);
    colLeft.appendChild(radioGroups.draftRate.group);

    // Language
    radioGroups.language = buildRadioGroup(t("opt_language"), "cs-language", [
      { value: "en", label: t("opt_english"), onSelect: setLanguage },
      { value: "tr", label: t("opt_turkish"), onSelect: setLanguage },
    ]);
    colLeft.appendChild(radioGroups.language.group);

    // Data Group (Right Column)
    const dataGroup = el("div", "cs-options-group");
    dataGroup.appendChild(el("label", "cs-label", t("opt_data")));
    
    const exportBtn = el("button", "cs-btn cs-option-action", t("opt_export"));
    exportBtn.type = "button";
    exportBtn.addEventListener("click", () => CS.exportImport.exportSnippets());
    
    const importReplaceBtn = el("button", "cs-btn cs-option-action", t("opt_import_replace"));
    importReplaceBtn.type = "button";
    
    const importMergeBtn = el("button", "cs-btn cs-option-action cs-option-secondary", t("opt_import_merge"));
    importMergeBtn.type = "button";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.className = "cs-hidden";
    
    importReplaceBtn.addEventListener("click", () => { fileInput.dataset.mode = "replace"; fileInput.click(); });
    importMergeBtn.addEventListener("click", () => { fileInput.dataset.mode = "merge"; fileInput.click(); });
    
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) CS.exportImport.importFromFile(file, fileInput.dataset.mode);
      fileInput.value = "";
    });

    dataGroup.appendChild(exportBtn);
    dataGroup.appendChild(importReplaceBtn);
    dataGroup.appendChild(importMergeBtn);
    dataGroup.appendChild(fileInput);
    colRight.appendChild(dataGroup);

    body.appendChild(colLeft);
    body.appendChild(colRight);
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
      for (const k of ["dark", "light", "dracula", "nord", "sepia", "dark-sepia"]) {
        radioGroups.theme.inputs[k].checked = s.theme === k;
      }
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
    if (radioGroups.draftRate) {
      radioGroups.draftRate.inputs.fast.checked = s.draftRate === "fast";
      radioGroups.draftRate.inputs.relaxed.checked = s.draftRate === "relaxed";
    }
    if (radioGroups.language) {
      radioGroups.language.inputs.en.checked = s.language === "en";
      radioGroups.language.inputs.tr.checked = s.language === "tr";
    }
  }

  function applySettingsToDom() {
    const host = CS.ui && CS.ui.host;
    if (!host) return;
    host.dataset.theme = CS.state.settings.theme;
    host.dataset.contrast = CS.state.settings.contrast;
    host.dataset.size = CS.state.settings.fontSize;
  }

  function setLanguage(lang) {
    if (CS.state.settings.language === lang) return;
    CS.state.settings.language = lang;
    CS.storage.persistSettings();
    CS.i18n.applyTranslations();
  }

  function setDraftRate(rate) {
    if (rate !== "fast" && rate !== "relaxed") return;
    if (CS.state.settings.draftRate === rate) return;
    CS.state.settings.draftRate = rate;
    CS.storage.persistSettings();
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
    const validThemes = ["dark", "light", "dracula", "nord", "sepia", "dark-sepia"];
    if (!validThemes.includes(theme)) return;
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

  CS.options = { buildOptionsView, syncOptionRadios, applySettingsToDom, setLayout, setTheme, setContrast, setFontSize, setDraftRate, setLanguage };
})();