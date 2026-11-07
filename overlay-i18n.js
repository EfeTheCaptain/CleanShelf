(() => {
  "use strict";
  const CS = globalThis.CleanShelf;
  if (!CS || CS.aborted) return;

  const dict = {
    en: {
      app_title: "CleanShelf",
      app_subtitle: "Save, folder, and copy your code snippets locally.",
      new_snippet: "New snippet",
      edit_snippet: "Edit snippet",
      title_placeholder: "Title",
      folder_placeholder: "Folder",
      folder_locked: "Folder (locked)",
      content_placeholder: "Paste your snippet here…",
      btn_save: "Save",
      btn_update: "Update",
      btn_cancel: "Cancel",
      your_snippets: "Your snippets",
      search_placeholder: "Search snippets by title, content, or folder...",
      btn_folder: "+ Folder",
      btn_subfolder: "+ Subfolder",
      btn_snippet: "+ Snippet",
      btn_back: "← Back",
      btn_compact: "Compact",
      btn_expand: "Expand",
      draft_label: "Draft",
      menu_edit: "Edit",
      menu_delete: "Delete",
      menu_rename: "Rename",
      menu_sort_newest: "Sort Newest",
      menu_sort_az: "Sort A-Z",
      menu_insert_subfolder: "Insert Subfolder",
      btn_debug: "Debug ▾",
      btn_debug_up: "Debug ▴",
      btn_tips: "? Tips",
      tip_title: "CleanShelf Tips",
      opt_title: "Options",
      opt_layout: "Layout",
      opt_grid: "Folder grid (icons, 3 columns)",
      opt_list: "List (grouped by folder)",
      opt_theme: "Color scheme",
      opt_dark: "Dark",
      opt_light: "Light",
      opt_dracula: "Dracula",
      opt_nord: "Nord",
      opt_sepia: "Sepia",
      opt_dark_sepia: "Dark Sepia",
      opt_contrast: "Contrast",
      opt_normal: "Normal",
      opt_high: "High",
      opt_font_size: "Font size",
      opt_sm: "Small",
      opt_md: "Medium",
      opt_lg: "Large",
      opt_draft_rate: "Draft Save Rate",
      opt_fast: "Fast (400ms after typing stops)",
      opt_relaxed: "Relaxed (2 seconds after typing stops)",
      opt_data: "Data",
      opt_export: "Export JSON",
      opt_import_replace: "Import (Replace)",
      opt_import_merge: "Import (Merge)",
      opt_language: "Language",
      opt_english: "English",
      opt_turkish: "Turkish",
      debug_last_error: "Last Error:",
      debug_checkup: "Checkup:",
      debug_run: "Run steps",
      debug_pass: "PASS",
      debug_fail: "FAIL",
      debug_run_step: "RUN",
      check_storage_api: "storage.local API",
      check_storage_round: "storage round-trip",
      check_snippets: "snippets readable",
      check_folders: "folders readable",
      check_settings: "settings readable",
      check_draft: "draft round-trip",
      check_clipboard: "clipboard API",
      check_crypto: "crypto.randomUUID",
      check_dom: "DOM refs bound",
      check_modules: "module functions",
      toast_saved: "Saved",
      toast_updated: "Updated",
      toast_deleted: "Snippet deleted",
      toast_folder_created: "Folder created",
      toast_subfolder_created: "Subfolder created",
      toast_moved: "Moved to {folder}",
      toast_restored: "Restored",
      toast_copied: "Copied to clipboard",
      toast_nothing: "Nothing to copy",
      toast_exported: "Exported {count} items",
      toast_imported: "Imported {count} items",
      err_empty: "Add a title or content",
      err_save: "Save failed",
      err_copy: "Copy failed",
      err_export: "Export failed",
      err_import: "Import failed",
      confirm_delete_snippet: "Delete this snippet?",
      confirm_delete_folder: 'There are {count} snippets in "{folder}". Are you sure you want to delete?',
      confirm_unsaved: "You have unsaved changes to this snippet.\n\nClick OK to Update, or Cancel to Discard changes.",
      confirm_duplicate: 'A snippet titled "{title}" already exists in this folder.\n\nClick OK to REPLACE it.\nClick Cancel to ADD AS NEW.',
      tip_rc: "<strong>Right-click</strong> snippets or folders for more options.",
      tip_backup: "<strong>Dev is not responsible for data loss. BACKUP YOUR DATA!</strong>",
      tip_local: "<strong>Data stays in your browser (up to ~10MB).</strong> No tracking. No network calls.",
      tip_copy: "Click any snippet card to instantly <strong>copy it to your clipboard</strong>.",
      tip_drag: "Drag & drop snippets onto folders to move them.",
      tip_reorder: "Drag & drop snippets inside a folder to <strong>manually reorder them</strong>.",
      tip_plus: "Use the <strong>+ Snippet</strong> button inside a folder to quickly add.",
      tip_subfolder: "Right-click a folder and select <strong>Insert Subfolder</strong> to group snippets.",
      tip_rename: "<strong>Double-click a Subfolder header</strong> to rename it. Right-click deletes it.",
      tip_drag_sub: "Drag & drop snippets onto a <strong>Subfolder</strong> to group them.",
    },
    tr: {
      app_title: "CleanShelf",
      app_subtitle: "Kod parçacıklarınızı yerel olarak kaydedin, klasörleyin ve kopyalayın.",
      new_snippet: "Yeni parçacık",
      edit_snippet: "Parçacığı düzenle",
      title_placeholder: "Başlık",
      folder_placeholder: "Klasör",
      folder_locked: "Klasör (kilitli)",
      content_placeholder: "Kod parçacığınızı buraya yapıştırın…",
      btn_save: "Kaydet",
      btn_update: "Güncelle",
      btn_cancel: "İptal",
      your_snippets: "Parçacıklarınız",
      search_placeholder: "Başlık, içerik veya klasöre göre arayın...",
      btn_folder: "+ Klasör",
      btn_subfolder: "+ Alt Klasör",
      btn_snippet: "+ Parçacık",
      btn_back: "← Geri",
      btn_compact: "Sıkıştır",
      btn_expand: "Genişlet",
      draft_label: "Taslak",
      menu_edit: "Düzenle",
      menu_delete: "Sil",
      menu_rename: "Yeniden Adlandır",
      menu_sort_newest: "En Yeniye Göre Sırala",
      menu_sort_az: "A-Z'ye Göre Sırala",
      menu_insert_subfolder: "Alt Klasör Ekle",
      btn_debug: "Hata Ayıklama ▾",
      btn_debug_up: "Hata Ayıklama ▴",
      btn_tips: "? İpuçları",
      tip_title: "CleanShelf İpuçları",
      opt_title: "Ayarlar",
      opt_layout: "Düzen",
      opt_grid: "Klasör ızgarası (simgeler, 3 sütun)",
      opt_list: "Liste (klasöre göre gruplandırılmış)",
      opt_theme: "Renk şeması",
      opt_dark: "Koyu",
      opt_light: "Açık",
      opt_dracula: "Dracula",
      opt_nord: "Nord",
      opt_sepia: "Sepya",
      opt_dark_sepia: "Koyu Sepya",
      opt_contrast: "Kontrast",
      opt_normal: "Normal",
      opt_high: "Yüksek",
      opt_font_size: "Yazı boyutu",
      opt_sm: "Küçük",
      opt_md: "Orta",
      opt_lg: "Büyük",
      opt_draft_rate: "Taslak Kaydetme Hızı",
      opt_fast: "Hızlı (yazmayı bıraktıktan 400ms sonra)",
      opt_relaxed: "Rahat (yazmayı bıraktıktan 2 saniye sonra)",
      opt_data: "Veri",
      opt_export: "JSON Dışa Aktar",
      opt_import_replace: "İçe Aktar (Değiştir)",
      opt_import_merge: "İçe Aktar (Birleştir)",
      opt_language: "Dil",
      opt_english: "İngilizce",
      opt_turkish: "Türkçe",
      debug_last_error: "Son Hata:",
      debug_checkup: "Kontrol:",
      debug_run: "Adımları çalıştır",
      debug_pass: "BAŞARILI",
      debug_fail: "BAŞARISIZ",
      debug_run_step: "ÇALIŞIYOR",
      check_storage_api: "storage.local API",
      check_storage_round: "depolama gidiş-dönüş",
      check_snippets: "parçacıklar okunabilir",
      check_folders: "klasörler okunabilir",
      check_settings: "ayarlar okunabilir",
      check_draft: "taslak gidiş-dönüş",
      check_clipboard: "pano API",
      check_crypto: "crypto.randomUUID",
      check_dom: "DOM referansları bağlı",
      check_modules: "modül fonksiyonları",
      toast_saved: "Kaydedildi",
      toast_updated: "Güncellendi",
      toast_deleted: "Parçacık silindi",
      toast_folder_created: "Klasör oluşturuldu",
      toast_subfolder_created: "Alt klasör oluşturuldu",
      toast_moved: "{folder} klasörüne taşındı",
      toast_restored: "Geri yüklendi",
      toast_copied: "Panoya kopyalandı",
      toast_nothing: "Kopyalanacak bir şey yok",
      toast_exported: "{count} öğe dışa aktarıldı",
      toast_imported: "{count} öğe içe aktarıldı",
      err_empty: "Bir başlık veya içerik ekleyin",
      err_save: "Kaydetme başarısız",
      err_copy: "Kopyalama başarısız",
      err_export: "Dışa aktarma başarısız",
      err_import: "İçe aktarma başarısız",
      confirm_delete_snippet: "Bu parçacık silinsin mi?",
      confirm_delete_folder: '"{folder}" klasöründe {count} parçacık var. Silmek istediğinizden emin misiniz?',
      confirm_unsaved: "Kaydedilmemiş değişiklikleriniz var.\n\nGüncellemek için Tamam'a, İptal etmek için İptal'e tıklayın.",
      confirm_duplicate: '"{title}" başlıklı bir parçacık bu klasörde zaten var.\n\nDeğiştirmek için Tamam\'a, yeni olarak eklemek için İptal\'e tıklayın.',
      tip_rc: "Daha fazla seçenek için parçacıklara veya klasörlere <strong>sağ tıklayın</strong>.",
      tip_backup: "<strong>Geliştirici veri kaybından sorumlu değildir. VERİLERİNİZİ YEDEKLEYİN!</strong>",
      tip_local: "<strong>Veriler tarayıcınızda kalır (~10MB'a kadar).</strong> İzleme yok. Ağ çağrısı yok.",
      tip_copy: "Panonuza kopyalamak için herhangi bir parçacığa tıklayın.",
      tip_drag: "Taşımak için parçacıkları sürükleyip klasörlere bırakın.",
      tip_reorder: "Manuel sıralamak için klasör içindeki parçacıkları sürükleyip bırakın.",
      tip_plus: "Hızlıca eklemek için klasör içindeki <strong>+ Parçacık</strong> düğmesini kullanın.",
      tip_subfolder: "Gruplamak için bir klasöre sağ tıklayın ve <strong>Alt Klasör Ekle</strong>'yi seçin.",
      tip_rename: "Yeniden adlandırmak için <strong>Alt Klasör başlığına çift tıklayın</strong>. Sağ tık siler.",
      tip_drag_sub: "Gruplamak için parçacıkları bir <strong>Alt Klasör'e</strong> sürükleyip bırakın.",
    }
  };

  function t(key, params) {
    const lang = (CS.state && CS.state.settings && CS.state.settings.language) || "en";
    const list = dict[lang] || dict.en;
    let str = list[key] || dict.en[key] || key;
    
    if (params) {
      for (const k in params) {
        str = str.replace(new RegExp(`{${k}}`, "g"), params[k]);
      }
    }
    return str;
  }

  function applyTranslations() {
    const host = CS.ui && CS.ui.host;
    if (!host || !host.shadowRoot) return;
    const shadow = host.shadowRoot;
    const lang = (CS.state && CS.state.settings && CS.state.settings.language) || "en";
    document.documentElement.lang = lang;

    shadow.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    shadow.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = t(key);
    });

    if (CS.state && CS.state.editingSnippetId) {
      if (CS.ui.formLabel) CS.ui.formLabel.textContent = t("edit_snippet");
      if (CS.ui.saveBtn) CS.ui.saveBtn.textContent = t("btn_update");
    } else {
      if (CS.ui.formLabel) CS.ui.formLabel.textContent = t("new_snippet");
      if (CS.ui.saveBtn) CS.ui.saveBtn.textContent = t("btn_save");
    }
  }

  CS.i18n = { t, applyTranslations };
})();