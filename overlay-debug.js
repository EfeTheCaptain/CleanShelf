  const checks = [
    {
      name: "check_storage_api",
      fn: () => { /* ... */ },
    },
    {
      name: "check_storage_round",
      fn: async () => { /* ... */ },
    },
    {
      name: "check_snippets",
      fn: async () => { /* ... */ },
    },
    {
      name: "check_folders",
      fn: async () => { /* ... */ },
    },
    {
      name: "check_settings",
      fn: async () => {
        const s = await CS.storage.getSettings();
        if (!["grid", "list"].includes(s.layout)) throw new Error("layout: " + s.layout);
        if (!["dark", "light", "dracula", "nord", "sepia", "dark-sepia"].includes(s.theme)) throw new Error("theme: " + s.theme);
        if (!["normal", "high"].includes(s.contrast)) throw new Error("contrast: " + s.contrast);
        if (!["sm", "md", "lg"].includes(s.fontSize)) throw new Error("fontSize: " + s.fontSize);
        if (!["fast", "relaxed"].includes(s.draftRate)) throw new Error("draftRate: " + s.draftRate);
        if (!["en", "tr"].includes(s.language)) throw new Error("language: " + s.language);
        return `${s.layout}/${s.theme}/${s.contrast}/${s.fontSize}/${s.draftRate}/${s.language}`;
      },
    },
    // ... rest of the checks
  ];